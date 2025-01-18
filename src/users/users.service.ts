import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { } // Внедряем PrismaService через DI

  // Создания нового пользователя
  async createUser(data: CreateUserDto) {
    return this.prismaService.prismaClient.user.create({ data });
  }

  // Получение всех пользователей
  async getAllUsers() {
    return this.prismaService.prismaClient.user.findMany();
  }

  // Получение пользователя по ID
  async getUserById(userId: number) {
    const user = await this.prismaService.prismaClient.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  // Обновление пользователя по ID
  async updateUser(userId: number, updateData: UpdateUserDto) {
    const user = +userId;

    try {
      return await this.prismaService.prismaClient.user.update({
        where: { user_id: user },
        data: updateData,
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  // Метод для удаления пользователя
  async deleteUser(userId: number) {
    return this.prismaService.prismaClient.user.delete({
      where: { user_id: userId },
    });
  }
}