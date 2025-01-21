import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly redisService: RedisService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // Генерация и сохранение кода в Redis
    async generateAndStoreCode(phone: string): Promise<string> {
        const code = this.generateCode();
        // Сохраняем код с TTL 10 минут
        await this.redisService.set(`verification_code:${phone}`, code, 600);
        return code;
    }

    // Проверка кода, который был введен пользователем
    async verifyCode(phone: string, code: string): Promise<boolean> {
        const savedCode = await this.redisService.get<string>(`verification_code:${phone}`);
        return savedCode === code;
    }

    // Создание JWT токена
    async createToken(user: User): Promise<string> {
        const payload = { userId: user.user_id, phone: user.phone };
        return this.jwtService.sign(payload);
    }

    // Генерация случайного кода
    private generateCode(): string {
        return crypto.randomInt(100000, 999999).toString();
    }
}




