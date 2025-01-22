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
    // Используем phone напрямую, без префикса "phone:"
    const key = phone;
    const codeString = String(code); // Явное преобразование в строку
    try {
      this.logger.log(`Попытка сохранить: Ключ=${key}, Значение=${codeString}, TTL=${ttl}`); // Лог перед SET
      const result = await this.client.set(key, codeString, 'EX', ttl);
      this.logger.log(`Результат Redis SET: ${result}`); // Лог после SET
      this.logger.log(`Телефон и код сохранены в Redis: ${key} = ${codeString}`);
    } catch (error) {
      this.logger.error(`Ошибка сохранения телефона и кода в Redis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCodeByPhone(phone: string): Promise<string | null> {
    const key = `phone:${phone}`;
    return this.get(key); // Используем существующий метод get
  }

  // Генерация и хранение кода (изменен ключ)
  async generateAndStoreCode(phone: string): Promise<string> {
    this.logger.log(`Генерация кода для телефона ${phone}`);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const key = `sms:${phone}`; // Ключ по-прежнему использует префикс "sms:"

    await this.set(key, code, 300); // 300 секунд = 5 минут
    return code;
  }

  // Сохранение временного пользователя
  async storeTempUser(phone: string, data: any, ttl = 900): Promise<void> { // 900 секунд = 15 минут
    await this.set(`temp_user:${phone}`, data, ttl);
  }

  // Получение временного пользователя
  async getTempUser(phone: string): Promise<any> {
    return this.get(`temp_user:${phone}`);
  }

  // Удаление временного пользователя
  async deleteTempUser(phone: string): Promise<void> {
    await this.del(`temp_user:${phone}`);
  }

  // Валидация кода
  async validateCode(phone: string, code: string): Promise<boolean> {
    const key = `sms:${phone}`;
    const savedCode = await this.get(key);

    if (!savedCode) {
      this.logger.warn(`No code found for phone ${phone}.`);
      return false;
    }

    if (savedCode !== code) {
      this.logger.warn(`Invalid code entered for phone ${phone}.`);
      return false;
    }

    await this.del(key); // Удаляем код после успешной валидации
    return true;
  }

  // Методы для работы с Redis (упрощенные)
  async set(key: string, value: any, expireInSeconds?: number): Promise<string> {
    const data = JSON.stringify(value);
    if (expireInSeconds) {
      return this.client.set(key, data, 'EX', expireInSeconds);
    }
    return this.client.set(key, data);
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Error getting data from Redis for key ${key}: ${error.message}`, error.stack);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds)
  }

  // Очистка ресурса при завершении работы модуля
  async onModuleDestroy() {
    await this.client.quit();
  }
}