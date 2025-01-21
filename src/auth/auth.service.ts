import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CompletePhoneDto } from './dto/complete-phone.dto'

@Injectable()
export class AuthService {
    constructor(
        private readonly redisService: RedisService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // Метод для обработки ввода телефона
    async phoneAuth(dto: CompletePhoneDto): Promise<string> {
        const { phone_number } = dto;

        // Генерация кода и временное хранение в Redis
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        await this.redisService.storeTempUser(phone_number, {
            phone_number,
            code,
            createdAt: new Date(),
        });

        // Код отправки SMS или Push OTP (можно реализовать тут).
        // await this.someSmsService.sendSms(phone_number, `Ваш код: ${code}`);

        return `Код отправлен на номер ${phone_number}`;
    }






}




