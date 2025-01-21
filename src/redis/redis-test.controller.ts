import { Controller, Get, Query } from '@nestjs/common';
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
        const phone = '79991234567'; // Пример телефона для генерации кода
        const code = await this.redisService.generateAndStoreCode(phone);
        return `Verification code sent for ${phone}. Check logs for code.`;
    }

    // Отправка кода
    @Get('send-code')
    async sendCode(@Query('phone') phone: string): Promise<string> {
        if (!phone) {
            return 'Phone number is required!';
        }

        await this.redisService.sendCode(phone);
        return `Verification code sent for ${phone}. Check logs for code.`;
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

    @Get('get-code')
    async getCode(@Query('phone') phone: string): Promise<any> {
        const code = await this.redisService.get(`sms:${phone}`);
        return code ? `Code for ${phone}: ${code}` : 'No code found!';
    }
}
