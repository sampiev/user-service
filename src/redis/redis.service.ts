import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_OPTIONS) private options: RedisOptions) {
    try {
      this.client = new Redis(options);
      this.client.on('connect', () => {
        this.logger.log('Успешное подключение к Redis');
      });
      this.client.on('error', (err) => {
        this.logger.error(`Ошибка подключения к Redis: ${err.message}`, err.stack);
      });
    } catch (error) {
      this.logger.error(`Ошибка создания клиента Redis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async storePhoneAndCode(phone: string, code: string, ttl = 300): Promise<void> {
    const key = phone; // Используем phone напрямую как ключ
    const codeString = String(code);
    try {
      this.logger.log(`Попытка сохранить: Ключ=${key}, Значение=${codeString}, TTL=${ttl}`);
      const result = await this.client.set(key, codeString, 'EX', ttl); // Сохраняем как строку
      this.logger.log(`Результат Redis SET: ${result}`);
      this.logger.log(`Телефон и код сохранены в Redis: ${key} = ${codeString}`);
    } catch (error) {
      this.logger.error(`Ошибка сохранения телефона и кода в Redis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCodeByPhone(phone: string): Promise<string | null> {
    const key = phone; // Используем phone напрямую как ключ
    try {
      const data = await this.client.get(key);
      return data; // Возвращаем строку напрямую (не парсим JSON)
    } catch (error) {
      this.logger.error(`Error getting data from Redis for key ${key}: ${error.message}`, error.stack);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}