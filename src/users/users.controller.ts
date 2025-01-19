import { ParseIntPipe, Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }


    //Получение пользователя по ID
    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getUserById(id);
    }

    //Получение пользователя по номеру телефона
    @Get('phone/:phone')
    async getUserByPhone(@Param('phone') phone: string) {
        return this.usersService.getUserByPhone(phone);
    }

    //Получение всех пользователей
    @Get()
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    //Создание пользователя
    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    //Изменение пользователя по ID
    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() updateData: UpdateUserDto) {
        return this.usersService.updateUser(id, updateData);
    }

    //Удаление пользователя по ID
    @Delete(':id')
    async deleteUser(@Param('id') id: number) {
        return this.usersService.deleteUser(Number(id));
    }

}

