import { Module, DynamicModule } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_OPTIONS } from './redis.constants';
import Redis, { RedisOptions } from 'ioredis';

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
        RedisService, // Обязательно добавляем RedisService
      ],
      exports: [RedisService], // Экспортируем RedisService для использования в других модулях
    };
  }
}


