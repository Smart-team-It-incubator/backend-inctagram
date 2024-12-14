import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthRepository } from './auth.repository';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { CustomConfigService } from '../../../libs/shared-dto/src/config-service';
import { CoreAppApiService } from '@core-app-api/core-app-api';

const ENV = process.env.NODE_ENV;
console.log("ENV полученный по команде для запуска auth:",ENV);

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: `.${ENV}.env`, // Определяем какой из ENV файлов подгрузиться, чтобы в зависимости от команды определялась БД (Production or Development)
  }), PrismaModule, HttpModule],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, AuthRepository, JwtService, CustomConfigService, CoreAppApiService],
  exports: [CustomConfigService]
})
export class AuthModule {}
