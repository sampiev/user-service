
import { Controller, Get, Post, Body, Query, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CompletePhoneDto } from './dto/complete-phone.dto';
import { Logger } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    private readonly logger = new Logger(AuthController.name);

    // Маршрут для ввода номера телефона
    @Post('phone-auth')
    @HttpCode(HttpStatus.OK)
    async phoneAuth(@Body() dto: CompletePhoneDto): Promise<string> {
        try {
            return await this.authService.phoneAuth(dto);
        } catch (error) {
            this.logger.error('Ошибка при аутентификации по телефону', error);
            throw error;
        }


    }

    // // Маршрут для проверки кода подтверждения
    // @Post('verify')
    // @HttpCode(HttpStatus.OK)
    // async verifyCode(
    //     @Body('phone_number') phone_number: string,
    //     @Body('code') code: string,
    // ): Promise<string> {
    //     return await this.authService.verifyCode(phone_number, code);
    // }


}
