import {
    ParseIntPipe,
    Controller,
    Get,
    Param,
    Post,
    Body,
    Patch,
    UsePipes,
    UseGuards,
    Request,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    ConflictException,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserByPhoneDto } from './dto/create-user-by-phone.dto';
import { User } from '@prisma/client'; // Импортируем User

@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post('create-by-phone')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    async createUserByPhone(@Body() data: CreateUserByPhoneDto): Promise<User> { // Типизация
        this.logger.log(`createUserByPhone: Попытка создать пользователя с номером ${data.phone_number}`);
        try {
            return await this.usersService.createUserByPhone(data);
        } catch (error) {
            this.logger.error(`createUserByPhone Error: ${error.message}`, error.stack);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe())
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: CompleteRegistrationDto,
    ): Promise<User> { // Типизация
        this.logger.log(`update: Попытка обновить пользователя с id ${id}`);
        try {
            const updatedUser = await this.usersService.completeRegistration(id, updateUserDto);
            if (!updatedUser) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            return updatedUser;
        } catch (error) {
            this.logger.error(`update Error: ${error.message}`, error.stack);
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update user');
        }
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Request() req): User { // Типизация
        return req.user;
    }


    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
        this.logger.log(`findOne: Request to get user with id ${id}`);
        try {
            const user = await this.usersService.findById(id);
            return user;
        } catch (error) {
            this.logger.error(`findOne Error: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error; // Перебрасываем NotFoundException
            }
            throw new InternalServerErrorException('Failed to get user'); // Остальные ошибки обрабатываем как 500
        }
    }
}