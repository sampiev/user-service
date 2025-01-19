import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: PrismaClient;


  constructor() {
    this.prismaClient = new PrismaClient();
  }

  public get getPrismaClient(): PrismaClient {
    return this.prismaClient;
  }

  async onModuleInit() {
    await this.prismaClient.$connect();
  }

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