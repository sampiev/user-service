import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [UsersController],
    providers: [PrismaService, UsersService, AuthModule],
    exports: [UsersService],
    imports: [RedisModule],
})
export class UsersModule { }


