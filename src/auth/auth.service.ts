import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private readonly redisService: RedisService) { }


    async sendVerificationCode(phone: string): Promise<void> {
        const code = this.generateCode(); // Ваша функция генерации кода
        try {
            await this.redisService.storePhoneAndCode(phone, code);
            // Отправка SMS с кодом (асинхронная операция)
            this.sendSms(phone, code); // Отдельная функция отправки СМС.
        } catch (error) {
            // Обработка ошибки сохранения в Redis. Очень важно!
            console.error("Failed to store phone and code", error)
            throw new Error('Failed to send verification code.'); // Или другая обработка
        }
    }

    async verifyCode(phone: string, code: string): Promise<boolean> {
        try {
            const storedCode = await this.redisService.getCodeByPhone(phone);
            if (storedCode === code) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.error("Failed to get code from redis", error)
            return false
        }
    }
    private generateCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    private sendSms(phone: string, code: string) {
        // тут отправка смс
        console.log(`Sending SMS to ${phone} with code ${code}`)
    }

    // /**
    //  * Генерация кода и сохранение номера телефона и кода в Redis
    //  * @param phone_number - Номер телефона пользователя
    //  */
    // async handlePhoneAuth(phone_number: string): Promise<void> {
    //     try {
    //         // Генерация 4-значного кода подтверждения
    //         const code = this.generateVerificationCode();
    //         this.logger.log(`Generated code for ${phone_number}: ${code}`);

    //         // Сохранение в Redis (ключ — номер телефона)
    //         const ttl = 300; // Время жизни данных в секундах (5 минут)
    //         await this.redisService.set(`phone:${phone_number}`, code, ttl);

    //         // Включите здесь логику отправки кода (e.g., SMS API)
    //         this.logger.log(`Code saved to Redis for ${phone_number}`);
    //     } catch (error) {
    //         this.logger.error('Error handling phone authentication:', error.message);
    //         throw error;
    //     }
    // }


    // /**
    //  * Генерация 4-значного кода подтверждения
    //  * @returns Четырехзначный код
    //  */
    // private generateVerificationCode(): string {
    //     return Math.floor(1000 + Math.random() * 9000).toString();
    // }
}





