import { DynamicModule, Module } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_OPTIONS } from './redis.constants';

@Module({})
export class RedisModule {
  /**
   * Метод для асинхронного подключения Redis-модуля с пользовательскими настройками.
   * @param options - Настройки для Redis.
   * @returns DynamicModule для регистрации модуля.
   */
  static register(options: RedisOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_OPTIONS, // Передача настроек в виде токена
          useValue: options,
        },
        RedisService,
      ],
      exports: [RedisService], // Экспорт RedisService для использования в других модулях
    };
  }
}

