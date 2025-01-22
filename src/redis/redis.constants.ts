// redis.constants.ts
import { RedisOptions } from 'ioredis';

export const redisConfig: RedisOptions = {
    host: 'redis', // Правильно для Docker Compose
    port: 6379,
    db: 0,
};

console.log("Redis Configuration:", redisConfig);

export const REDIS_OPTIONS = 'REDIS_OPTIONS';

