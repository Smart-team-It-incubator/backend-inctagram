import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/core_app';

@Injectable()
export class PrismaCoreAppService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Выбираем базу данных в зависимости от окружения
    const databaseUrl = process.env.DATABASE_URL
      
    console.log("DATABASE_URL полученный по команде для запуска core_app:",databaseUrl);
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
