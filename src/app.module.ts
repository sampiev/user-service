import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SmsAuthService } from './sms-auth/sms-auth.service';




@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, SmsAuthService],
})
export class AppModule { }
