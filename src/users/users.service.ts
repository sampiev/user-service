import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, Logger, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { CreateUserByPhoneDto } from './dto/create-user-by-phone.dto';
import { User, Prisma } from '@prisma/client';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface UpdateUserInput {
  name?: string;
  surname?: string;
  avatarUrl?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prismaService: PrismaService) { }

  async createUserByPhone(data: CreateUserByPhoneDto): Promise<User> {
    try {
      return this.prismaService.prismaClient.user.create({
        data: {
          phone_number: data.phone_number,
          status: { connect: { name: 'incomplete' } },
          role: { connect: { id: 1 } },
        },
        include: { status: true, role: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Phone number already exists');
        }
        this.logger.error(`createUserByPhone: Prisma Error ${error.code}: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to create user');
      }
      this.logger.error(`createUserByPhone: Unknown error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }



  async completeRegistration(id: number, data: UpdateUserInput): Promise<User> {
    this.logger.debug(`completeRegistration: Starting validation for user ID: ${id}`);

    try {
      // Преобразование данных в DTO
      const dto = plainToInstance(CompleteRegistrationDto, data);

      // Запуск валидации
      await validateOrReject(dto);

      this.logger.debug(`completeRegistration: Validation successful`);
      this.logger.debug(`completeRegistration: Data after validation: ${JSON.stringify(dto)}`);

      const updatedUser = await this.prismaService.prismaClient.user.update({
        where: { user_id: id },
        data: {
          name: dto.name,
          surname: dto.surname,
          avatarUrl: dto.avatarUrl,
          status: {
            connect: {
              name: 'active', // Связываем пользователя со статусом 'active'
            },
          },
          is_verified: true,
        },
        include: { status: true, role: true },
      });

      this.logger.debug(`completeRegistration: User updated successfully. Updated user: ${JSON.stringify(updatedUser)}`);
      return updatedUser;
    } catch (error) {
      if (error instanceof Array) {
        // Валидация данных не прошла
        this.logger.error(
          `completeRegistration: Validation errors: ${error.map((e) => e.toString()).join('; ')}`
        );
        throw new BadRequestException('Invalid input data');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Prisma Error Meta: ${JSON.stringify(error.meta)}`);
      }

      this.logger.error(`completeRegistration: Error during update:`, error);
      throw new InternalServerErrorException('Failed to complete user registration');
    }
  }



  async findByPhone(phone: string) {
    try {
      return this.prismaService.prismaClient.user.findUnique({
        where: {
          phone_number: phone,
        },
        include: {
          status: true,
          role: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`findByPhone: Prisma Error ${error.code}: ${error.message}`, error.stack);
      } else {
        this.logger.error(`findByPhone: Unknown error: ${error.message}`, error.stack);
      }
      throw new InternalServerErrorException('Failed to find user');
    }
  }



  async findById(id: number): Promise<User> {
    this.logger.debug(`findById: Finding user with id: ${id}`);
    try {
      const user = await this.prismaService.prismaClient.user.findUnique({
        where: { user_id: id },
        include: { status: true, role: true },
      });

      if (!user) {
        this.logger.warn(`findById: User with id ${id} not found`);
        throw new NotFoundException(`User with id ${id} not found`);
      }

      this.logger.debug(`findById: User found: ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error(`findById: Error finding user:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`findById: Prisma Error Code: ${error.code}`);
        this.logger.error(`findById: Prisma Error Meta: ${JSON.stringify(error.meta)}`);
      }
      throw new InternalServerErrorException('Failed to find user');
    }
  }
}