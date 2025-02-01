
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthRepository } from './auth.repository';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { EmailAdapterService } from '@app/email-service';
import { RecaptchaAdapter } from './utils/recaptcha_adapter';
import { GithubAuthController } from './github/github.controller';
import { GithubStrategy } from './github/github.adapter';
import { PassportModule } from '@nestjs/passport';
import { AuthApiService } from 'auth-api/auth-api';
import { TelegramService } from '@app/email-service/telegram-service';
import { HttpExceptionFilter } from '@app/filters/http-exception.filter';
import { RabbitClientLoggerService } from '@app/rabbit_client_logger';
import { APP_FILTER } from '@nestjs/core';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.ENV_FILE, // Загружаем файл из переменной окружения, если нужно
  }), PrismaModule, HttpModule, PassportModule],
  controllers: [AuthController, GithubAuthController],
  providers: [PrismaService, AuthService, AuthRepository, JwtService, CoreAppApiService, AuthApiService, EmailAdapterService, RecaptchaAdapter, GithubStrategy, TelegramService,
        RabbitClientLoggerService,  // Регистрация сервиса для инжекции в фильтр
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,  // Использование фильтра в качестве глобального
        },
  ],
  exports: [ RecaptchaAdapter]
})
export class AuthModule {}
