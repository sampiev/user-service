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



    //Эндпойнт авторизации-регистрации по номеру телефона
    @Post('auth-by-phone')
    @HttpCode(HttpStatus.OK)
    async authByPhone(@Body() dto: CompletePhoneDto): Promise<{}> {
        try {
            await this.authService.sendVerificationCode(dto.phone_number);
            return { message: 'Код успешно отправлен', expiresIn: 300 };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }



    //Эндпойнт подтверждения кода
    @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    async verifyCode(@Body() verifyCodeDto: VerifyCodeDto, @Res({ passthrough: true }) res: Response): Promise<any> {
        this.logger.log(`AuthController: verifyCode - START`);
        try {
            const isCodeValid = await this.authService.verifyCode(verifyCodeDto.phone_number, verifyCodeDto.verification_code);

            if (isCodeValid) {
                this.logger.log(`AuthController: verifyCode - Код валиден, вызываем handleUserAfterVerification`);
                const result = await this.authService.authByPhone(verifyCodeDto.phone_number);
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
        } catch (error) {
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


