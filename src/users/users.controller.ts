import {
    ParseIntPipe,
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    Patch,
    UsePipes,
    UseGuards,
    Request,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    ConflictException,

} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserByPhoneDto } from './dto/create-user-by-phone.dto';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }



    @Patch(':id')
    @UsePipes(new ValidationPipe())
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        try {
            const updatedUser = await this.usersService.updateUser(id, updateUserDto);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }



    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Request() req) {
        return req.user;
    }



    // Эндпойнт для создания пользователя по номеру телефона
    @Post('create-by-phone')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    async createUserByPhone(@Body() data: CreateUserByPhoneDto) {
        try {
            console.log("Создаем");
            return await this.usersService.createUserByPhone(data);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            console.error("Error in controller:", error);
            throw error;
        }
    }



}



