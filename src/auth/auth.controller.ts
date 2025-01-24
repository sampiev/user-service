import { Controller, Post, Body, HttpCode, HttpStatus, HttpException, Logger, Res, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CompletePhoneDto } from './dto/complete-phone.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post('auth-by-phone')
    @HttpCode(HttpStatus.OK)
    async authByPhone(@Body() dto: CompletePhoneDto): Promise<{ message: string; expiresIn: number }> {
        this.logger.log('authByPhone: запрос на отправку кода для телефона ' + dto.phone_number); // Добавляем лог
        try {
            await this.authService.sendVerificationCode(dto.phone_number);
            return { message: 'Код успешно отправлен', expiresIn: 300 };
        } catch (error) {
            this.logger.error('authByPhone Error:', error); // Use logger
            throw new HttpException(error.message || 'Failed to send verification code', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    async verifyCode(@Body() verifyCodeDto: VerifyCodeDto, @Res({ passthrough: true }) res: Response) {
        this.logger.log('verifyCode: запрос на верификацию кода для телефона ' + verifyCodeDto.phone_number); // Добавляем лог
        try {
            const isCodeValid = await this.authService.verifyCode(
                verifyCodeDto.phone_number,
                verifyCodeDto.verification_code,
            );

            if (!isCodeValid) {
                throw new UnauthorizedException('Invalid code'); // Более конкретное исключение
            }

            let result;
            const existingUser = await this.usersService.findByPhone(verifyCodeDto.phone_number);

            if (existingUser) {
                this.logger.log('verifyCode: Пользователь найден, вызываем loginByPhone'); // Добавляем лог
                result = await this.authService.loginByPhone(verifyCodeDto.phone_number);
            } else {
                this.logger.log('verifyCode: Пользователь не найден, вызываем registerByPhone'); // Добавляем лог
                result = await this.authService.registerByPhone(verifyCodeDto.phone_number);
            }

            if (result.needsCompletion) {
                res.setHeader('Authorization', `Bearer ${result.accessToken}`);
                return { needsCompletion: true, accessToken: result.accessToken, userId: result.userId };
            } else if (result.accessToken) {
                res.setHeader('Authorization', `Bearer ${result.accessToken}`);
                return process.env.NODE_ENV === 'development' ? { accessToken: result.accessToken } : {};
            } else {
                throw new InternalServerErrorException('Непредвиденная ошибка');
            }
        } catch (error) {
            this.logger.error('verifyCode Error:', error); // Use logger
            if (error instanceof HttpException) {
                throw error; // Re-throw HttpException instances
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR); // Default error handling
        }
    }
}


