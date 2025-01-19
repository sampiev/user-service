import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) { }


  // Создание нового пользователя
  async createUser(data: CreateUserDto) {
    return this.prismaService.getPrismaClient.user.create({ data });
  }


  async findOrCreateUserByPhone(phoneNumber: string) {
    let user = await this.prismaService.getPrismaClient.user.findUnique({
      where: { phone: phoneNumber },
    });
    if (!user) {
      user = await this.createUser({ phone: phoneNumber } as CreateUserDto);
    }
    return user;
  }


  // Получение всех пользователей
  async getAllUsers() {
    return this.prismaService.getPrismaClient.user.findMany();
  }

  // Получение пользователя по ID
  async getUserById(userId: number) {
    const user = await this.prismaService.getPrismaClient.user.findUnique({
      where: { user_id: userId },
    });
    return user;
  }


  // Получение пользователя по номеру телефона
  async getUserByPhone(phone: string) {
    return this.prismaService.getPrismaClient.user.findUnique({
      where: { phone },
    });
  }



  // Обновление пользователя по ID
  async updateUser(userId: number, updateData: UpdateUserDto) {
    const user = +userId;

    try {
      return await this.prismaService.getPrismaClient.user.update({
        where: { user_id: user },
        data: updateData,
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  // Метод для удаления пользователя
  async deleteUser(userId: number) {
    return this.prismaService.getPrismaClient.user.delete({
      where: { user_id: userId },
    });
  }
}