import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Импортируем firstValueFrom из RxJS

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.authRepository.getUserByUsername(username);
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
    };
  }


  async register(userData: any) {
    // Ваш код для регистрации пользователя
    return this.authRepository.createUser(userData);
  }

    // Генерация Access Token для пользователя
    async generateAccessToken(userId: string): Promise<string> {
      // Получаем данные пользователя через HTTP запрос в Core_app
      const user = await this.getUserFromCoreApp(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      const payload = { userId: user.id, username: user.username };
      return this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET, // Секретный ключ для Access Token
        expiresIn: '15m', // Время жизни токена, например, 15 минут
      });
    }
  
    // Генерация Refresh Token для пользователя
    async generateRefreshToken(userId: string): Promise<string> {
      // Получаем данные пользователя через HTTP запрос в Core_app
      const user = await this.getUserFromCoreApp(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      const payload = { userId: user.id };
      return this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET, // Секретный ключ для Refresh Token
        expiresIn: '7d', // Время жизни refresh токена, например, 7 дней
      });
    }
  
    // Проверка, был ли токен отозван
    async isTokenRevoked(token: string): Promise<boolean> {
      // Для проверки отозванности токенов нам нужно хранить список отозванных токенов
      // Например, в базе данных или Redis. Здесь пока делаем заглушку.
      const revokedTokens = await this.getRevokedTokens();
      return revokedTokens.includes(token);
    }
  
    // Заглушка для получения отозванных токенов
    private async getRevokedTokens(): Promise<string[]> {
      // Логика получения отозванных токенов (например, из базы данных или Redis)
      return []; // Пустой список означает, что нет отозванных токенов
    }
  
    // Получение данных пользователя из Core_app через HTTP запрос
    private async getUserFromCoreApp(userId: string) {
      try {
        const response = await firstValueFrom(this.httpService.get(`http://localhost:3000/api/v1/users/${userId}`)); // Заменили toPromise на firstValueFrom
        return response.data; // Возвращаем данные пользователя
      } catch (error) {
        // Обработка ошибок, если не удалось получить данные пользователя
        throw new HttpException('Error fetching user data from Core_app', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    // Метод для хеширования refresh токенов (если нужно)
    async hashRefreshToken(token: string): Promise<string> {
      return bcrypt.hash(token, 10);
    }
  
    // Метод для проверки хеша refresh токена (если нужно)
    async verifyRefreshTokenHash(token: string, hash: string): Promise<boolean> {
      return bcrypt.compare(token, hash);
    }
}
