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
    async verifyCode(@Body() verifyCodeDto: VerifyCodeDto, @Res({ passthrough: true }) res: Response) {
        try {
            const isCodeValid = await this.authService.verifyCode(
                verifyCodeDto.phone_number,
                verifyCodeDto.verification_code,
            );

            if (isCodeValid) {
                let result;
                const existingUser = await this.usersService.findByPhone(verifyCodeDto.phone_number);

                if (existingUser) {
                    result = await this.authService.loginByPhone(verifyCodeDto.phone_number);
                } else {
                    result = await this.authService.registerByPhone(verifyCodeDto.phone_number);
                }

                if (result.needsCompletion) {
                    res.setHeader('Authorization', `Bearer ${result.accessToken}`);
                    return { needsCompletion: true, accessToken: result.accessToken };
                } else if (result.accessToken) {
                    res.setHeader('Authorization', `Bearer ${result.accessToken}`);
                    return process.env.NODE_ENV === 'development' ? { accessToken: result.accessToken } : {};
                }
            } else {
                throw new HttpException('Invalid code', HttpStatus.UNAUTHORIZED);
            }
        } catch (error) {
            console.error(error);
            if (error instanceof HttpException) {
                throw error
            }

            throw new HttpException("Непредвиденная ошибка", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }



}


