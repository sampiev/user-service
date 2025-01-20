import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_OPTIONS) private options: RedisOptions,
  ) {
    this.client = new Redis(options);
  }

  // Генерация и сохранение кода
  async generateAndStoreCode(phone: string): Promise<string> {
    this.logger.log(`Attempting to generate code for phone ${phone}`);  // Логирование до генерации

    const key = `sms:${phone}`;
    const ttl = await this.client.ttl(key);  // Получаем TTL для текущего ключа

    if (ttl > 0 && ttl > 240) {
      this.logger.warn(`Code already sent recently for phone ${phone}`);
      throw new Error('Code already sent. Please wait before retrying.');
    }

    // Генерация 4-значного кода
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.logger.log(`Generated code for phone ${phone}: ${code}`);  // Логирование сгенерированного кода

    // Сохранение в Redis с сроком хранения 5 минут (300 секунд)
    await this.set(key, code, 300);

    return code;  // Возвращаем сгенерированный код
  }

  // Метод для записи данных
  async set(key: string, value: any, expireInSeconds?: number): Promise<string> {
    const data = JSON.stringify(value);
    if (expireInSeconds) {
      return this.client.set(key, data, 'EX', expireInSeconds);
    }
    return this.client.set(key, data);
  }

  // Метод для получения данных
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Метод для удаления ключей
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  // Очистка ресурса при завершении работы модуля
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

