import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../redis/redis.module';

@Module({
    controllers: [UsersController],
    providers: [PrismaService, UsersService],
    exports: [UsersService],
    imports: [RedisModule],
})
export class UsersModule { }


