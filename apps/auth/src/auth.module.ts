
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
import { EmailAdapterService } from '@app/email-service';
import { RecaptchaAdapter } from './utils/recaptcha_adapter';
import { GithubAuthController } from './github/github.controller';
import { GithubStrategy } from './github/github.adapter';
import { PassportModule } from '@nestjs/passport';


//console.log('DATABASE_URL из process.env:', process.env.DATABASE_URL_DEV);
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.ENV_FILE, // Загружаем файл из переменной окружения, если нужно
  }), PrismaModule, HttpModule, PassportModule],
  controllers: [AuthController, GithubAuthController],
  providers: [PrismaService, AuthService, AuthRepository, JwtService, CustomConfigService, CoreAppApiService, EmailAdapterService, RecaptchaAdapter, GithubStrategy],
  exports: [CustomConfigService, RecaptchaAdapter]
})
export class AuthModule {}
