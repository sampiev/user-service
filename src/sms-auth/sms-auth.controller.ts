
import { Controller, Post, Body } from '@nestjs/common';
import { SmsAuthService } from './sms-auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('sms-auth')
export class SmsAuthController {
    constructor(
        private readonly smsAuthService: SmsAuthService,
        private readonly usersService: UsersService,
    ) { }

    // Endpoint для отправки SMS с кодом
    @Post('send-code')
    async sendCode(@Body('phone') phone: string) {
        if (!phone) {
            throw new Error('Phone number is required');
        }

        const code = await this.smsAuthService.sendCode(phone);

        return { message: 'SMS sent successfully', code }; // Не отправляем код в реальности
    }

    @Post('verify')
    async verify(@Body('phone') phone: string, @Body('code') code: string) {
        const user = await this.smsAuthService.verifyCode(phone, code);

        if (!user) {
            return { message: 'Invalid code or phone number.' };
        }

        // Если код верный, создаем пользователя с дополнительными полями
        const newUser: CreateUserDto = {
            phone,
            name: 'Default Name',  // Поставить значения по умолчанию
            surname: 'Default Surname',
            email: 'default@example.com',
            password: 'defaultpassword',
            regStatus: 'started',
        };
        await this.usersService.createUser(newUser);

        return { message: 'User registered successfully' };
    }

    // Endpoint для верификации кода
    @Post('verify-code')
    async verifyCode(@Body('phone') phone: string, @Body('code') code: string) {
        if (!phone || !code) {
            throw new Error('Phone number and code are required');
        }

        const isVerified = await this.smsAuthService.verifyCode(phone, code);

        if (isVerified) {
            const user = await this.usersService.findOrCreateUserByPhone(phone);
            return { message: 'Phone number verified successfully', user };
        } else {
            return { message: 'Invalid or expired verification code' };
        }
    }

    @Post('register')
    async register(@Body('phone') phone: string) {
        const code = await this.smsAuthService.sendCode(phone);
        return { message: `Code sent to ${phone}`, code }; // Возвращаем сообщение и сгенерированный код
    }
}




// import { Body, Controller, Post } from '@nestjs/common';
// import { SmsAuthService } from './sms-auth.service';

// @Controller('sms-auth')
// export class SmsAuthController {
//     constructor(private readonly smsAuthService: SmsAuthService) { }

//     @Post('send')
//     async sendCode(@Body('phoneNumber') phoneNumber: string) {
//         const code = await this.smsAuthService.sendCode(phoneNumber);
//         return { message: 'Код отправлен (симуляция)', code }; // Возвращаем код для тестирования
//     }

//     @Post('verify')
//     async verifyCode(
//         @Body('phoneNumber') phoneNumber: string,
//         @Body('code') code: string,
//     ) {
//         const isValid = await this.smsAuthService.verifyCode(phoneNumber, code);

//         if (!isValid) {
//             return { message: 'Неверный код или код истек', success: false };
//         }

//         return { message: 'Код успешно подтвержден', success: true };
//     }
// }

