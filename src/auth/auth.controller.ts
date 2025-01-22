import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
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
    async phoneAuth(@Body() dto: CompletePhoneDto): Promise<void> {
        try {
            await this.authService.sendVerificationCode(dto.phone_number);
            this.logger.log(`Sent verification code to phone number: ${dto.phone_number}`);
            return; // No content expected in successful response
        } catch (error) {
            this.logger.error('Error sending verification code:', error.message);
            throw error; // Re-throw for global error handling
        }
    }
}

