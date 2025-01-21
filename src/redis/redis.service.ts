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




  // Генерация и хранение кода с защитой от спама по IP и номеру телефона
  async generateAndStoreCode(phone: string, ip: string): Promise<string> {
    this.logger.log(`Attempting to generate code for phone ${phone} from IP ${ip}`);

    // Проверяем TTL для текущего ключа
    const phoneKey = `sms:${phone}`;
    const ttl = await this.client.ttl(phoneKey);

    //
    if (ttl > 0 && ttl > 240) {
      this.logger.warn(`Code already sent recently for phone ${phone}`);
      throw new Error('Code already sent. Please wait before retrying.');
    }

    // Лимит на количество запросов для одного номера (1 запрос в минуту)
    const requestLimitKey = `sms-req-limit:${phone}`;
    const requestCount = await this.client.get(requestLimitKey);

    if (requestCount && parseInt(requestCount) >= 1) {
      throw new Error('Too many requests. Please wait for a minute before trying again.');
    }

    // Лимит для одного IP (например, 5 попыток за минуту)
    const ipLimitKey = `sms-ip-limit:${ip}`;
    const ipRequestCount = await this.client.get(ipLimitKey);

    if (ipRequestCount && parseInt(ipRequestCount) >= 5) {
      throw new Error('Too many requests from your IP. Please wait for a minute before trying again.');
    }

    // Генерация 4-значного кода
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.logger.log(`Generated code for phone ${phone}: ${code}`);

    // Сохранение кода в Redis с TTL 5 минут (300 секунд)
    await this.set(phoneKey, code, 300);

    // Устанавливаем лимит на запросы для IP и номера (например, 5 попыток в минуту)
    await this.client.incr(ipLimitKey);
    await this.client.expire(ipLimitKey, 60);  // Жизнь ключа — 60 секунд

    // Устанавливаем лимит для одного номера (1 запрос в минуту)
    await this.client.setex(requestLimitKey, 60, '1'); // Лимит 1 запрос в минуту

    // Возвращаем код
    return code;
  }







  async storeTempUser(phone: string, data: any, ttl = 900): Promise<void> {
    await this.client.set(`temp_user:${phone}`, JSON.stringify(data), 'EX', ttl);
  }




  async getTempUser(phone: string): Promise<any> {
    const data = await this.client.get(`temp_user:${phone}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteTempUser(phone: string): Promise<void> {
    await this.client.del(`temp_user:${phone}`);
  }












  // Отправка кода (вместо реальной отправки, просто логируем)
  async sendCode(phone: string): Promise<void> {
    const ip = '127.0.0.1';  // Фиктивный IP для теста
    const code = await this.generateAndStoreCode(phone, ip);  // Генерация и сохранение кода
    this.logger.log(`Verification code sent for phone ${phone}: ${code}`);
    // Здесь можно добавить реальную отправку через SMS-сервис в будущем.
  }


  // Метод для записи данных в Redis
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
