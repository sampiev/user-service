import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SmsAuthService } from './sms-auth/sms-auth.service';
import { SmsAuthController } from './sms-auth/sms-auth.controller';




@Module({
  imports: [UsersModule],
  controllers: [AppController, SmsAuthController],
  providers: [AppService, SmsAuthService],
})
export class AppModule { }
