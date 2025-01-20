import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    @Inject(REDIS_OPTIONS) private options: RedisOptions,
  ) {
    this.client = new Redis(options);
  }

  // Сохранить данные
  async set(key: string, value: any, expireInSeconds?: number): Promise<string> {
    const data = JSON.stringify(value);
    if (expireInSeconds) {
      return this.client.set(key, data, 'EX', expireInSeconds);
    }
    return this.client.set(key, data);
  }

  // Получить данные
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Удалить данные
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  // Генерация и хранение кода
  async generateAndStoreCode(phone: string): Promise<string> {
    const key = `sms:${phone}`; // Ключ для хранения в Redis
    const ttl = await this.client.ttl(key); // Проверка оставшегося времени жизни

    if (ttl > 0 && ttl > 240) { // Блокируем, если < 1 мин до истечения срока действия
      throw new Error('Code already sent. Please wait before retrying.');
    }

    // Генерация 4-значного кода
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // Всегда 4 цифры

    // Сохранение кода в Redis с TTL 5 минут
    await this.set(key, code, 300);

    return code; // Для тестов. В реальном приложении код не возвращаем.
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}



// import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
// import Redis, { RedisOptions } from 'ioredis';
// import { REDIS_OPTIONS } from './redis.constants';

// @Injectable()
// export class RedisService implements OnModuleDestroy {
//   private readonly client: Redis;

//   constructor(
//     @Inject(REDIS_OPTIONS) private readonly options: RedisOptions, // Типизация параметров
//   ) {
//     this.client = new Redis(options); // Создание экземпляра Redis-клиента
//   }

//   /**
//    * Запись данных в Redis с возможным сроком действия.
//    * @param key - Ключ.
//    * @param value - Значение.
//    * @param expireInSeconds - Срок действия ключа в секундах.
//    */
//   async set(key: string, value: any, expireInSeconds?: number): Promise<string> {
//     const data = JSON.stringify(value);
//     if (expireInSeconds) {
//       return this.client.set(key, data, 'EX', expireInSeconds); // Установка ключа с истечением срока действия
//     }
//     return this.client.set(key, data); // Установка ключа без срока действия
//   }

//   /**
//    * Чтение данных из Redis.
//    * @param key - Ключ.
//    * @returns Распарсенные данные или null.
//    */
//   async get<T = any>(key: string): Promise<T | null> {
//     const data = await this.client.get(key);
//     return data ? JSON.parse(data) : null; // Парсинг данных из строки
//   }

//   /**
//    * Удаление ключей из Redis.
//    * @param key - Ключ.
//    * @returns Количество удалённых ключей.
//    */
//   async del(key: string): Promise<number> {
//     return this.client.del(key);
//   }

//   /**
//    * Завершение работы с Redis-клиентом.
//    */
//   async onModuleDestroy(): Promise<void> {
//     await this.client.quit(); // Закрытие соединения
//   }
// }

