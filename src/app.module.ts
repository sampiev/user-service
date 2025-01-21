import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SmsAuthModule } from './sms-auth/sms-auth.module';
import { RedisModule } from './redis/redis.module';
import { RedisTestController } from './redis/redis-test.controller';
import { AuthModule } from './auth/auth.module';




@Module({
  imports: [UsersModule, RedisModule, AuthModule,
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      password: 'mypassword'
    })
  ],
  controllers: [AppController, RedisTestController],
  providers: [AppService],
})
export class AppModule { }
