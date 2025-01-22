import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RedisService } from '../redis/redis.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
    let authService: AuthService;
    let redisService: jest.Mocked<RedisService>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: RedisService,
                    useValue: {
                        storePhoneAndCode: jest.fn(),
                        getCodeByPhone: jest.fn(),
                        del: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        redisService = moduleRef.get<RedisService>(RedisService) as jest.Mocked<RedisService>;
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    describe('sendVerificationCode', () => {
        it('should call redisService.storePhoneAndCode with correct arguments', async () => {
            const phone = '+79991234567';
            await authService.sendVerificationCode(phone);
            expect(redisService.storePhoneAndCode).toHaveBeenCalledWith(phone, expect.any(String));
        });

        it('should throw HttpException if redisService.storePhoneAndCode throws an error', async () => {
            const phone = '+79991234567';
            const errorMessage = 'Redis error';
            const expectedError = new HttpException('Failed to send verification code', HttpStatus.INTERNAL_SERVER_ERROR)
            redisService.storePhoneAndCode.mockRejectedValueOnce(new Error(errorMessage));

            try {
                await authService.sendVerificationCode(phone);
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.status).toBe(expectedError.getStatus());
                expect(error.message).toBe(expectedError.message);
            }
        });
    });

    describe('verifyCode', () => {
        it('should return true if code is valid', async () => {
            redisService.getCodeByPhone.mockResolvedValueOnce('1234');
            const isValid = await authService.verifyCode('+79991234567', '1234');
            expect(isValid).toBe(true);
            expect(redisService.del).toHaveBeenCalledWith('+79991234567');
        });

        it('should return false if code is invalid', async () => {
            redisService.getCodeByPhone.mockResolvedValueOnce('1234');
            const isValid = await authService.verifyCode('+79991234567', '1235');
            expect(isValid).toBe(false);
            expect(redisService.del).not.toHaveBeenCalled();
        });

        it('should return false if code is not found', async () => {
            redisService.getCodeByPhone.mockResolvedValueOnce(null);
            const isValid = await authService.verifyCode('+79991234567', '1234');
            expect(isValid).toBe(false);
            expect(redisService.del).not.toHaveBeenCalled();
        });

        it('should handle redisService.getCodeByPhone throwing error', async () => {
            const phone = '+79991234567';
            const errorMessage = 'Redis error';
            const expectedError = new HttpException('Ошибка верификации кода', HttpStatus.INTERNAL_SERVER_ERROR)
            redisService.getCodeByPhone.mockRejectedValueOnce(new Error(errorMessage));

            try {
                await authService.verifyCode(phone, '1234');
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.status).toBe(expectedError.getStatus());
                expect(error.message).toBe(expectedError.message);
            }
        });
    });
});