import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt.service';

@Module({
    imports: [
        JwtModule.register({
            secret: 'your_secret_key', // Вставь сюда свой секретный ключ
            signOptions: { expiresIn: '1h' }, // Устанавливаем время жизни токена
        }),
    ],
    providers: [JwtAuthService],
    exports: [JwtAuthService],
})
export class JwtAuthModule { }
