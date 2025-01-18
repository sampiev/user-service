import { Body, Controller, Post } from '@nestjs/common';
import { SmsAuthService } from './sms-auth.service';

@Controller('sms-auth')
export class SmsAuthController {
    constructor(private readonly smsAuthService: SmsAuthService) { }

    @Post('send')
    async sendCode(@Body('phoneNumber') phoneNumber: string) {
        const code = await this.smsAuthService.sendCode(phoneNumber);
        return { message: 'Код отправлен (симуляция)', code }; // Возвращаем код для тестирования
    }

    @Post('verify')
    async verifyCode(
        @Body('phoneNumber') phoneNumber: string,
        @Body('code') code: string,
    ) {
        const isValid = await this.smsAuthService.verifyCode(phoneNumber, code);

        if (!isValid) {
            return { message: 'Неверный код или код истек', success: false };
        }

        return { message: 'Код успешно подтвержден', success: true };
    }
}

