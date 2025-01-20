import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis-test')
export class RedisTestController {
    constructor(private readonly redisService: RedisService) { }

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
