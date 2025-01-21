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

    async register(phone: string) {
        console.log('Registering user with phone:', phone);
        // Здесь можно добавить проверку номера, например через регулярные выражения или другие критерии

        // Вызываем метод usersService для создания или поиска пользователя
        const user = await this.usersService.findOrCreateUserByPhone(phone);

        // Далее можно генерировать и возвращать JWT или другие данные по вашему требованию
        const payload = { phone: user.phone };  // Добавьте нужные данные из user
        const token = this.jwtService.sign(payload);

        return { token };  // Отправляем JWT в ответ
    }

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




