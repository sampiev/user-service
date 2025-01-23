import { ParseIntPipe, Controller, Get, Param, Post, Body, Put, Delete, Patch, UsePipes, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Patch(':id')
    @UsePipes(new ValidationPipe()) // Валидация DTO
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        try {
            const updatedUser = await this.usersService.updateUser(id, updateUserDto);
            return updatedUser; // Возвращаем обновленного пользователя
        } catch (error) {
            // Обработка ошибок, например, если пользователь не найден
            throw error; // Важно пробросить ошибку для обработки на уровне выше
        }
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Request() req) {
        return req.user;
    }


}

