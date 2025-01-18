import { Module } from '@nestjs/common';
import { SmsAuthService } from './sms-auth.service';
import { SmsAuthController } from './sms-auth.controller';
import { UsersModule } from '../users/users.module'; // Импортируем UsersModule, если нужно использовать UsersService

@Module({
    imports: [UsersModule], // Импортируем UsersModule для использования UsersService в SmsAuthService
    providers: [SmsAuthService], // Указываем SmsAuthService в providers
    controllers: [SmsAuthController], // Указываем SmsAuthController в controllers
})
export class SmsAuthModule { }
