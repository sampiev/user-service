import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserByPhoneDto } from './dto/create-user-by-phone.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) { }



  // Создание пользователя через номер телефона
  async createUserByPhone(data: CreateUserByPhoneDto) {
    try {
      return this.prismaService.prismaClient.user.create({
        data: {
          phone_number: data.phone_number,
          status: { connect: { name: 'incomplete' } },
          role: { connect: { id: 1 } },
        },
        include: {
          status: true,
          role: true
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Phone number already exists');
      }
      console.error("Error creating user:", error);
      throw error;
    }
  }



  //Поиск пользователя по номеру телефона
  async findByPhone(phone: string) {
    try {
      return this.prismaService.prismaClient.user.findUnique({
        where: {
          phone_number: phone
        },
        include: {
          status: true,
          role: true
        },
      });
    } catch (error) {
      console.error("Error finding user by phone:", error);
      throw error;
    }
  }



  //Добавление имени и фамилии
  async updateUser(id: number, data: UpdateUserDto) {
    try {
      return this.prismaService.prismaClient.user.update({
        where: { user_id: id },
        data: {
          name: data.name,
          surname: data.surname,
          avatarUrl: data.avatarUrl,
          status: { connect: { name: 'incomplete' } },
          role: { connect: { name: 'user' } },
        },
        include: { status: true, role: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      console.error("Error updating user:", error);
      throw error;
    }
  }



}