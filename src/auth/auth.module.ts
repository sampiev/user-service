import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        RedisModule.register({
            host: 'redis',  // Параметры подключения к Redis
            port: 6379,
        }),
        forwardRef(() => UsersModule),
        JwtModule.register({
            secret: 'yourSecretKey', // Используйте секретный ключ для генерации JWT
            signOptions: { expiresIn: '1h' }, // Срок жизни токена (можно изменить)
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule { }

