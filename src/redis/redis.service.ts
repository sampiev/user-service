import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    @Inject(REDIS_OPTIONS) private readonly options: RedisOptions, // Типизация параметров
  ) {
    this.client = new Redis(options); // Создание экземпляра Redis-клиента
  }

  /**
   * Запись данных в Redis с возможным сроком действия.
   * @param key - Ключ.
   * @param value - Значение.
   * @param expireInSeconds - Срок действия ключа в секундах.
   */
  async set(key: string, value: any, expireInSeconds?: number): Promise<string> {
    const data = JSON.stringify(value);
    if (expireInSeconds) {
      return this.client.set(key, data, 'EX', expireInSeconds); // Установка ключа с истечением срока действия
    }
    return this.client.set(key, data); // Установка ключа без срока действия
  }

  /**
   * Чтение данных из Redis.
   * @param key - Ключ.
   * @returns Распарсенные данные или null.
   */
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null; // Парсинг данных из строки
  }

  /**
   * Удаление ключей из Redis.
   * @param key - Ключ.
   * @returns Количество удалённых ключей.
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Завершение работы с Redis-клиентом.
   */
  async onModuleDestroy(): Promise<void> {
    await this.client.quit(); // Закрытие соединения
  }
}

