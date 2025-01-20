import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SmsAuthModule } from './sms-auth/sms-auth.module';
import { RedisModule } from './redis/redis.module';




@Module({
  imports: [UsersModule, SmsAuthModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
