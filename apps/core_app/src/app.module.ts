import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';

const ENV = process.env.NODE_ENV;
console.log(ENV);
@Module({
  imports: [PrismaModule, UserModule,ConfigModule.forRoot({
    envFilePath: `.${ENV}.env`, // Определяем какой из ENV файлов подгрузиться, чтобы в зависимости от команды определялась БД (Production or Development)
  }),],
  controllers: [AppController, UserController],
  providers: [AppService, PrismaService, UserService],
})
export class AppModule {}
