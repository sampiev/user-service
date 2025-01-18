import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SmsAuthModule } from './sms-auth/sms-auth.module';




@Module({
  imports: [UsersModule, SmsAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
