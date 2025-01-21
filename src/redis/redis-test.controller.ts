import { Controller, Get, Query, Request } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis-test')
export class RedisTestController {
    constructor(private readonly redisService: RedisService) { }

    @Get('set')
    async setTestKey(): Promise<string> {
        await this.redisService.set('test-key', { hello: 'world' }, 60);  // Устанавливаем ключ с TTL 60 секунд
        return 'Key set successfully!';
    }

    @Get('get')
    async getTestKey(): Promise<any> {
        const value = await this.redisService.get('test-key');
        return value || 'No data found!';
    }

    @Get('del')
    async deleteTestKey(): Promise<string> {
        await this.redisService.del('test-key');
        return 'Key deleted successfully!';
    }

    @Get('generate-code')
    async generateCode(): Promise<string> {
        const phone = '79991234567';  // Пример телефона для генерации кода
        const ip = '127.0.0.1';       // Фиктивный IP для теста

        // Теперь передаем и номер телефона, и IP-адрес
        const code = await this.redisService.generateAndStoreCode(phone, ip);

        return `Verification code sent for ${phone}. Check logs for code.`;
    }

    // Отправка кода
    @Get('send-code')
    async sendCode(@Query('phone') phone: string, @Request() req): Promise<string> {
        if (!phone) {
            return 'Phone number is required!';
        }

        try {
            // Добавляем IP-адрес клиента, поступающий из запроса
            const ip = req.ip;

            await this.redisService.generateAndStoreCode(phone, ip);
            return `Verification code sent for ${phone}. Check logs for code.`;
        } catch (error) {
            return error.message || 'Something went wrong!';
        }
    }

    // Валидация кода
    @Get('validate-code')
    async validateCode(@Query('phone') phone: string, @Query('code') code: string): Promise<string> {
        if (!phone || !code) {
            return 'Phone and code are required!';
        }

        const isValid = await this.redisService.validateCode(phone, code);
        if (isValid) {
            return `Code validated successfully for ${phone}.`;
        }
        return `Invalid code for ${phone}.`;
    }
}
