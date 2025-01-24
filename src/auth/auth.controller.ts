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
        this.logger.log('verifyCode: запрос на верификацию кода для телефона ' + verifyCodeDto.phone_number);  // Лог перед верификацией

        try {
            const isCodeValid = await this.authService.verifyCode(
                verifyCodeDto.phone_number,
                verifyCodeDto.verification_code,
            );

            // Лог, если код неверный
            if (!isCodeValid) {
                this.logger.warn('verifyCode: Неверный код для телефона ' + verifyCodeDto.phone_number); // Лог при неудаче
                throw new UnauthorizedException('Invalid code');
            }

            let result;

            // Проверка существующего пользователя
            const existingUser = await this.usersService.findByPhone(verifyCodeDto.phone_number);

            if (existingUser) {
                this.logger.log('verifyCode: Пользователь найден, вызываем loginByPhone');
                result = await this.authService.loginByPhone(verifyCodeDto.phone_number);
            } else {
                this.logger.log('verifyCode: Пользователь не найден, вызываем registerByPhone');
                result = await this.authService.registerByPhone(verifyCodeDto.phone_number);
            }

            // Логирование результата
            if (result.needsCompletion) {
                this.logger.log(`verifyCode: Необходима дополнительная информация для пользователя с телефоном ${verifyCodeDto.phone_number}`);
                res.setHeader('Authorization', `Bearer ${result.accessToken}`);
                return { needsCompletion: true, accessToken: result.accessToken, userId: result.userId };
            } else if (result.accessToken) {
                this.logger.log(`verifyCode: Успешная авторизация пользователя с телефоном ${verifyCodeDto.phone_number}`);
                res.setHeader('Authorization', `Bearer ${result.accessToken}`);
                this.logger.log(`verifyCode: Результат авторизации - ${JSON.stringify(result)}`);
                return { accessToken: result.accessToken, userId: result.userId };
            } else {
                this.logger.error('verifyCode: Не удалось завершить запрос. Результат не содержит токена');
                throw new InternalServerErrorException('Непредвиденная ошибка');
            }
        } catch (error) {
            // Логирование ошибки
            this.logger.error('verifyCode Error:', error);  // Лог при ошибке
            if (error instanceof HttpException) {
                throw error; // Если ошибка — это HttpException, пробрасываем ее дальше
            }
            // Лог при внутренних ошибках
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}


