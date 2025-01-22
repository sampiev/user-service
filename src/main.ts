import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Установка глобального фильтра для обработки ошибок Prisma
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  // Установка ValidationPipe для валидации запросов
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет поля, которых нет в DTO
      forbidNonWhitelisted: true, // Запрещает лишние поля, выбрасывает ошибку
      transform: true, // Автоматически преобразует входные данные
    }),
  );

  await app.listen(3000);
}
bootstrap();

