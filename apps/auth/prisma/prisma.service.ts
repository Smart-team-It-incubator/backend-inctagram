import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/auth';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Выбираем базу данных в зависимости от окружения
    const databaseUrl = process.env.DATABASE_URL

    console.log("DATABASE_URL полученный по команде для запуска auth:", databaseUrl);
    // Передаём URL в PrismaClient
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: ['query', 'info', 'warn', 'error'], // Подключаем логирование
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
