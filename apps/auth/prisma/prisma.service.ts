import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/auth';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Выбираем базу данных в зависимости от окружения
    console.log("Node ENV value:", process.env.NODE_ENV);
    let databaseUrl = ''
    if (process.env.NODE_ENV === 'TEST') {
      databaseUrl = process.env.DATABASE_URL_TEST
    }
    if (process.env.NODE_ENV === 'DEV') {
      databaseUrl = process.env.DATABASE_URL_AUTH_DEV
    }
    else {
      databaseUrl = process.env.DATABASE_URL_AUTH
    }
    console.log("DATABASE_URL полученный по команде для запуска core_app:", databaseUrl);
    // Передаём URL в PrismaClient
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      //log: ['query', 'info', 'warn', 'error'], // Подключаем логирование
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
