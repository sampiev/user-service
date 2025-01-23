import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    HttpException,
    Logger,
    Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CompletePhoneDto } from './dto/complete-phone.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) { }

    @Post('phone-auth')
    @HttpCode(HttpStatus.OK)
    async phoneAuth(@Body() dto: CompletePhoneDto): Promise<{}> {
        this.logger.log('AuthController: phoneAuth - START');
        try {
            await this.authService.sendVerificationCode(dto.phone_number);
            this.logger.log(`AuthController: phoneAuth - sendVerificationCode completed`);
            return { message: 'Verification code sent successfully', expiresIn: 300 }; // Возвращаем пустой объект
        } catch (error) {
            this.logger.error('AuthController: phoneAuth - ERROR:', error);

            // Более подробная обработка ошибок
            if (error instanceof HttpException) {
                throw error; // Re-throw HttpException
            } else if (error instanceof Error) {
                // Обработка стандартных ошибок JavaScript (например, TypeError, RangeError)
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                // Обработка других типов ошибок
                throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    async verifyCode(@Body() verifyCodeDto: VerifyCodeDto, @Res({ passthrough: true }) res: Response): Promise<any> {
        this.logger.log(`AuthController: verifyCode - START`);
        try { // Оборачиваем весь код в try...catch для отлова ошибок
            const isCodeValid = await this.authService.verifyCode(verifyCodeDto.phone_number, verifyCodeDto.verification_code);

            if (isCodeValid) {
                this.logger.log(`AuthController: verifyCode - Код валиден, вызываем handleUserAfterVerification`);
                const result = await this.authService.handleUserAfterVerification(verifyCodeDto.phone_number); // <--- await здесь!
                this.logger.log(`AuthController: verifyCode - Результат handleUserAfterVerification:`, result);

                if (result.needsCompletion) {
                    this.logger.log(`AuthController: verifyCode - needsCompletion: true`);
                    return { needsCompletion: true };
                } else if (result.accessToken) {
                    this.logger.log(`AuthController: verifyCode - accessToken: ${result.accessToken}`);
                    res.header('Authorization', `Bearer ${result.accessToken}`);
                    return { accessToken: result.accessToken };
                }
            } else {
                this.logger.warn(`AuthController: verifyCode - Неверный код`);
                throw new HttpException('Invalid code', HttpStatus.UNAUTHORIZED);
            }
        } catch (error) { // Обрабатываем ошибки
            this.logger.error(`AuthController: verifyCode - Ошибка:`, error);
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        this.logger.log(`AuthController: verifyCode - END`);
    }
}


