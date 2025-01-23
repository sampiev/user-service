import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) { }

  async create(data: CreateUserDto) {
    try {
      return this.prismaService.prismaClient.user.create({
        data: {
          phone_number: data.phone_number,
          status: {
            connect: { name: 'incomplete' },
          },
        },
        include: { status: true }
      });
    } catch (error) {
      if (error.code === 'P2002') { // Код ошибки Prisma для нарушения уникальности
        throw new ConflictException('Phone number already exists'); // Выбрасываем ConflictException (409 Conflict)
      }
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async findByPhone(phone: string) {
    try {
      return this.prismaService.prismaClient.user.findUnique({
        where: { phone_number: phone },
        include: { status: true }, // Включаем связанные данные status
      });
    } catch (error) {
      console.error("Error finding user by phone:", error);
      throw error;
    }
  }

  async updateUser(id: number, data: UpdateUserDto) {
    try {
      return this.prismaService.prismaClient.user.update({
        where: { user_id: id },
        data: {
          name: data.name,
          surname: data.surname,
          status: {
            connect: { name: 'active' },
          },
        },
        include: { status: true }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Получение пользователя по ID
  // async getUserById(userId: number) {
  //   const user = await this.prismaService.prismaClient.user.findUnique({
  //     where: { user_id: userId },
  //   });
  //   return user;
  // }


  // Получение всех пользователей
  // async getAllUsers() {
  //   return this.prismaService.prismaClient.user.findMany();
  // }


  // // Обновление пользователя по ID
  // async updateUser(userId: number, updateData: UpdateUserDto) {
  //   const user = +userId;

  //   try {
  //     return await this.prismaService.prismaClient.user.update({
  //       where: { user_id: user },
  //       data: updateData,
  //     });
  //   } catch (error) {
  //     throw new NotFoundException(`User with ID ${userId} not found`);
  //   }
  // }

  // // Метод для удаления пользователя
  // async deleteUser(userId: number) {
  //   return this.prismaService.prismaClient.user.delete({
  //     where: { user_id: userId },
  //   });
  // }
}