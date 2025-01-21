
import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    // Регистрация пользователя
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto, @Query('phone') phone: string) {
        const user = await this.usersService.findOrCreateUserByPhone(phone);
        if (user) {
            throw new BadRequestException('User already registered');
        }
        const newUser = await this.usersService.createUser(createUserDto);
        return newUser;
    }

    // Отправка кода на телефон
    @Get('send-code')
    async sendCode(@Query('phone') phone: string) {
        const code = await this.authService.generateAndStoreCode(phone);
        return { message: `Verification code sent to ${phone}`, code }; // Реально отправка через SMS будет позже
    }

    // Подтверждение кода
    @Post('verify-code')
    async verifyCode(@Query('phone') phone: string, @Body('code') code: string) {
        const isValid = await this.authService.verifyCode(phone, code);
        if (!isValid) {
            throw new BadRequestException('Invalid verification code');
        }

        const user = await this.usersService.getUserByPhone(phone);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const token = await this.authService.createToken(user);
        return { token };
    }
}
