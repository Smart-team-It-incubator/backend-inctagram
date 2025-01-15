import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthForm } from '@app/shared-dto/dtos/auth/auth-form.dto';

@Injectable()
export class AuthApiService {
  private readonly authAppUrl: string;

  constructor(private readonly httpService: HttpService) {
    // Адрес микросервиса Auth берется из переменных окружения
    this.authAppUrl = process.env.AUTH_APP_URL || 'http://127.0.0.1:4000/auth';
  }

  // Метод для хеширования пароля
  async hashPassword(password: string): Promise<string> {
    try {
      console.log(`${this.authAppUrl}/hash-password`, { password }, "Запрос попал в библиотеку метод hash-password"); 
      const response = await firstValueFrom(
        this.httpService.post(`${this.authAppUrl}/auth/hash-password`, { password }),
      );
      //console.log("response", response.data)
      return response.data; // Возвращается строка password сразу в виде хэша
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message || error);
      throw new HttpException(
        'Error hashing password via Auth microservice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Логин пока используется под Github OAuth
  async login (loginDto: AuthForm) {
    try {
      console.log(`${this.authAppUrl}/login`, loginDto, "Запрос попал в библиотеку метод Login"); 
      const response = await firstValueFrom(
        this.httpService.post(`${this.authAppUrl}/auth/login`, loginDto, {
          withCredentials: true, // Это обеспечит передачу кук с запросом
        }),
      );
      console.log("Мы в библиотеке, метод Login - resonse.data", response.data)
      // console.log("полный response", response)
      return {
        accessToken: response.data,
        refreshToken: response.headers['set-cookie'][0]
      };
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message || error);
      throw new HttpException(
        'Error Login via Auth microservice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
