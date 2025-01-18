import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
    constructor(private readonly jwtService: JwtService) { }

    // Метод для генерации токена
    generateToken(userId: number, phone: string) {
        const payload = { userId, phone };
        return this.jwtService.sign(payload);
    }

    // Метод для верификации токена
    verifyToken(token: string) {
        return this.jwtService.verify(token);
    }
}
