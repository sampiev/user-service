import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) { }


  // Получение пользователя по ID
  async getUserById(userId: number) {
    const user = await this.prismaService.prismaClient.user.findUnique({
      where: { user_id: userId },
    });
    return user;
  }

  // Получение пользователя по номеру телефона
  // async getUserByPhone(phone: string) {
  //   const user = await this.prismaService.prismaClient.user.findUnique({
  //     where: { phone },
  //   });
  //   return user;
  // }

  // Создание нового пользователя
  // async createUser(data: CreateUserDto) {
  //   return this.prismaService.prismaClient.user.create({ data });
  // }


  // async findOrCreateUserByPhone(phoneNumber: string) {
  //   console.log('Phone number:', phoneNumber);  // Логируем телефонный номер

  //   if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
  //     throw new Error('Phone number is required');
  //   }

  //   let user = await this.prismaService.prismaClient.user.findUnique({
  //     where: {
  //       phone: phoneNumber,
  //     },
  //   });

  //   if (!user) {
  //     user = await this.createUser({ phone: phoneNumber } as CreateUserDto);
  //   }

  //   return user;
  // }


  // Получение всех пользователей
  async getAllUsers() {
    return this.prismaService.prismaClient.user.findMany();
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