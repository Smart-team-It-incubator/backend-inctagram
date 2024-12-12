import { Module } from '@nestjs/common';
import { AuthController } from './app.controller';
import { AuthService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthRepository } from './app.repository';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';

const ENV = process.env.NODE_ENV;
console.log(ENV);

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: `.${ENV}.env`, // Определяем какой из ENV файлов подгрузиться, чтобы в зависимости от команды определялась БД (Production or Development)
  }), PrismaModule, HttpModule],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, AuthRepository, JwtService],
})
export class AuthModule {}
