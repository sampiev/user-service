import { Injectable, Logger, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async sendVerificationCode(phone: string): Promise<void> {
        this.logger.log('sendVerificationCode: START');
        const code = this.generateCode();

        try {
            await this.redisService.storePhoneAndCode(phone, code);
            this.sendSms(phone, code);
        } catch (error) {
            this.logger.error(`sendVerificationCode: ERROR: ${error.message}`, error.stack);
            throw new HttpException('Failed to send verification code', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log('sendVerificationCode - DONE');
        return; // Explicit return for void function
    }

    private generateCode(): string {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        this.logger.debug(`generateCode: Сгенерирован код: ${code}`);
        return code;
    }

    private sendSms(phone: string, code: string) {
        console.log(`Отправка СМС на ${phone} с кодом ${code}`)
    }

    private generateJwtPayload(user): any {
        return {
            sub: user.user_id,
            phone: user.phone_number,
            role: user.role.name,
        };
    }

    async registerByPhone(phone: string): Promise<{ accessToken?: string; needsCompletion: true; userId: number }> {
        this.logger.log(`registerByPhone: регистрация пользователя с телефоном ${phone}`)
        try {
            const user = await this.usersService.createUserByPhone({ phone_number: phone });
            const payload = this.generateJwtPayload(user);
            const accessToken = await this.jwtService.signAsync(payload);
            return { accessToken, needsCompletion: true, userId: user.user_id };
        } catch (error) {
            this.logger.error(`registerByPhone: ERROR: ${error.message}`, error.stack);
            throw error;
        }
    }

    async loginByPhone(phone: string): Promise<{ accessToken: string }> {
        this.logger.log(`loginByPhone: вход пользователя с телефоном ${phone}`)
        try {
            const user = await this.usersService.findByPhone(phone);

            if (!user) {
                throw new UnauthorizedException('Пользователь с таким номером не найден');
            }

            if (user.statusName !== 'active') {
                throw new UnauthorizedException('Аккаунт не активирован');
            }

            const payload = this.generateJwtPayload(user);
            const accessToken = await this.jwtService.signAsync(payload);
            return { accessToken };
        } catch (error) {
            this.logger.error(`loginByPhone: ERROR: ${error.message}`, error.stack);
            throw error;
        }
    }

    async verifyCode(phone: string, code: string): Promise<boolean> {
        try {
            const storedCode = await this.redisService.getCodeByPhone(phone);

            if (storedCode === null) {
                this.logger.warn(`AuthService: verifyCode - Код для телефона ${phone} не найден.`);
                return false;
            }

            const storedCodeString = String(storedCode);
            const codeString = String(code);

            if (storedCodeString !== codeString) {
                this.logger.warn(`AuthService: verifyCode - Неверный код введен для телефона ${phone}.`);
                return false;
            }

            await this.redisService.del(phone);
            return true;
        } catch (error) {
            this.logger.error(`AuthService: verifyCode - Ошибка при получении кода из redis: ${error.message}`, error.stack);
            throw new HttpException('Ошибка верификации кода', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}