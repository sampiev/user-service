import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    HttpException,
    Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CompletePhoneDto } from './dto/complete-phone.dto';

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
}


