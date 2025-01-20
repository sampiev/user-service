import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis-test')
export class RedisTestController {
    constructor(private readonly redisService: RedisService) { }

    // Генерация кода для указанного телефона
    @Get('generate-code')
    async generateCode(@Query('phone') phone: string): Promise<string> {
        if (!phone) {
            throw new BadRequestException('Phone number is required.');
        }

        try {
            const code = await this.redisService.generateAndStoreCode(phone);
            return `Verification code sent: ${code}`; // В реальной практике код не возвращаем напрямую
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // Прочие тесты с Redis
    @Get('set')
    async setTestKey(): Promise<string> {
        await this.redisService.set('test-key', { hello: 'world' }, 60); // Ключ с TTL 60 секунд
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
}



// import { Controller, Get } from '@nestjs/common';
// import { RedisService } from './redis.service';

// @Controller('redis-test')
// export class RedisTestController {
//     constructor(private readonly redisService: RedisService) { }

//     @Get('set')
//     async setTestKey(): Promise<string> {
//         await this.redisService.set('test-key', { hello: 'world' }, 60); // Ключ с TTL 60 секунд
//         return 'Key set successfully!';
//     }

//     @Get('get')
//     async getTestKey(): Promise<any> {
//         const value = await this.redisService.get('test-key');
//         return value || 'No data found!';
//     }

//     @Get('del')
//     async deleteTestKey(): Promise<string> {
//         await this.redisService.del('test-key');
//         return 'Key deleted successfully!';
//     }
// }
