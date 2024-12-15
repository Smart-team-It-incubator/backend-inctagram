import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthApiService {
  private readonly authAppUrl: string;

  constructor(private readonly httpService: HttpService) {
    // Адрес микросервиса Auth берется из переменных окружения
    this.authAppUrl = process.env.AUTH_APP_URL || 'http://localhost:4000';
  }

  // Метод для хеширования пароля
  async hashPassword(password: string): Promise<string> {
    try {
      console.log(`${this.authAppUrl}/hash-password`, { password }); 
      const response = await firstValueFrom(
        this.httpService.post(`${this.authAppUrl}/hash-password`, { password }),
      );
      
      return response.data.password; // Предполагаем, что ответ содержит hashedPassword
    } catch (error) {
      //console.error('Error details:', error.response?.data || error.message || error);
      throw new HttpException(
        'Error hashing password via Auth microservice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
