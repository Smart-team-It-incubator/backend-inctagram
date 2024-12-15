import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaCoreAppService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Выбираем базу данных в зависимости от окружения
    const databaseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.DATABASE_URL_PROD
        : process.env.DATABASE_URL_DEV;
      
        //console.log("DATABASE_URL полученный по команде для запуска auth:",databaseUrl);
    // Передаём URL в PrismaClient
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}