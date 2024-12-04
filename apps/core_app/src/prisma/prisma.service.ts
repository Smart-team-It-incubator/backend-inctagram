import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Выбираем базу данных в зависимости от окружения

    // console.log('NODE_ENV:', process.env.NODE_ENV);
    // console.log('DATABASE_URL_PROD:', process.env.DATABASE_URL_PROD);
    // console.log('DATABASE_URL_DEV:', process.env.DATABASE_URL_DEV);
    const databaseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.DATABASE_URL_PROD
        : process.env.DATABASE_URL_DEV;

    console.log(process.env.NODE_ENV === 'production', process.env.NODE_ENV);

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
