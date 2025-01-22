import { Test } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

jest.mock('ioredis'); // Мокируем ioredis

describe('RedisService', () => {
    let service: RedisService;
    let redisMock: jest.Mocked<Redis>;

    beforeEach(async () => {
        redisMock = new Redis() as jest.Mocked<Redis>; // Создаем мок
        // ... (остальной код beforeEach)
    });

    it('should store phone and code', async () => {
        // ...
        redisMock.set.mockResolvedValueOnce('OK'); // Мокируем ответ Redis
        // ...
    });

    // ... другие тесты
});