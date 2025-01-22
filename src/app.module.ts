import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';




@Module({
  imports: [UsersModule, RedisModule, AuthModule,
    RedisModule.register({
      host: 'redis',
      port: 6379,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
