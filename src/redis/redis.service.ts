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

  // Отправка кода (вместо реальной отправки, просто логируем)
  async sendCode(phone: string): Promise<void> {
    const code = await this.generateAndStoreCode(phone);  // Генерация и сохранение кода
    this.logger.log(`Verification code sent for phone ${phone}: ${code}`);
    // Здесь можно добавить реальную отправку через SMS-сервис в будущем.
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




  async validateCode(phone: string, code: string): Promise<boolean> {
    const key = `sms:${phone}`;
    const savedCode = await this.get(key);

    if (!savedCode) {
      this.logger.warn(`No code found for phone ${phone}.`);
      return false; // Нет сохраненного кода
    }

    if (savedCode !== code) {
      this.logger.warn(`Invalid code entered for phone ${phone}.`);
      return false; // Код не совпадает
    }

    this.logger.log(`Code validated successfully for phone ${phone}.`);
    // Удаляем код из Redis после успешной валидации
    await this.del(key);
    return true;
  }

}





// import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
// import Redis, { RedisOptions } from 'ioredis';
// import { REDIS_OPTIONS } from './redis.constants';

// @Injectable()
// export class RedisService implements OnModuleDestroy {
//   private readonly client: Redis;
//   private readonly logger = new Logger(RedisService.name);

//   constructor(
//     @Inject(REDIS_OPTIONS) private options: RedisOptions,
//   ) {
//     this.client = new Redis(options);
//   }

//   // Генерация и сохранение кода
//   async generateAndStoreCode(phone: string): Promise<string> {
//     this.logger.log(`Attempting to generate code for phone ${phone}`);  // Логирование до генерации

//     const key = `sms:${phone}`;
//     const ttl = await this.client.ttl(key);  // Получаем TTL для текущего ключа

//     if (ttl > 0 && ttl > 240) {
//       this.logger.warn(`Code already sent recently for phone ${phone}`);
//       throw new Error('Code already sent. Please wait before retrying.');
//     }

//     // Генерация 4-значного кода
//     const code = Math.floor(1000 + Math.random() * 9000).toString();
//     this.logger.log(`Generated code for phone ${phone}: ${code}`);  // Логирование сгенерированного кода

//     // Сохранение в Redis с сроком хранения 5 минут (300 секунд)
//     await this.set(key, code, 300);

//     return code;  // Возвращаем сгенерированный код
//   }

//   // Метод для записи данных
//   async set(key: string, value: any, expireInSeconds?: number): Promise<string> {
//     const data = JSON.stringify(value);
//     if (expireInSeconds) {
//       return this.client.set(key, data, 'EX', expireInSeconds);
//     }
//     return this.client.set(key, data);
//   }

//   // Метод для получения данных
//   async get<T = any>(key: string): Promise<T | null> {
//     const data = await this.client.get(key);
//     return data ? JSON.parse(data) : null;
//   }

//   // Метод для удаления ключей
//   async del(key: string): Promise<number> {
//     return this.client.del(key);
//   }

//   // Очистка ресурса при завершении работы модуля
//   async onModuleDestroy() {
//     await this.client.quit();
//   }
// }
