import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  private databaseUrl: string;
  private coreAppUrl: string;

  constructor(private readonly configService: ConfigService) {
    
    const environment = this.configService.get<string>('NODE_ENV', 'development'); // По умолчанию 'development'
    // console.log('NODE_ENV:', process.env.NODE_ENV); // Логируем среду выполнения
    // console.log('CORE_APP_URL:', this.configService.get<string>('CORE_APP_URL')); // Логируем значение из ConfigService
    this.databaseUrl =
    environment === 'production'
        ? this.configService.get<string>('DATABASE_URL_PROD')
        : this.configService.get<string>('DATABASE_URL_DEV');

    this.coreAppUrl = this.configService.get<string>('CORE_APP_URL');
  }

  getDatabaseUrl(): string {
    return this.databaseUrl;
  }

  getCoreAppUrl(): string {
    return this.coreAppUrl;
  }
}