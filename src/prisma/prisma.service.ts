import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public prismaClient: PrismaClient; //Cоздаем приватное свойство для хранения экземпляра PrismaClient

  constructor() {
    // Создаем экземпляр PrismaClient
    this.prismaClient = new PrismaClient();
  }

  // Метод, вызываемый при инициализации модуля
  async onModuleInit() {
    await this.prismaClient.$connect();
  }

  // Метод, вызываемый при завершении работы модуля
  async onModuleDestroy() {
    await this.prismaClient.$disconnect();
  }

}
































// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

//   async onModuleInit() {
//     await this.$connect();
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//   }
// }