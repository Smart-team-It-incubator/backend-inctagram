import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Импортируем firstValueFrom из RxJS
import { AuthForm } from '@app/shared-dto/dtos/auth-form.dto';
import { CustomConfigService } from '../../../libs/shared-dto/src/config-service';
import { CoreAppApiService } from '@core-app-api/core-app-api';


@Injectable()
export class AuthService {
  private jwtAccessSecret: string
  private jwtRefreshSecret: string 
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: CustomConfigService,
    private readonly coreAppApiService: CoreAppApiService
  ) { 
    this.jwtAccessSecret = this.configService.getJwtAccessSecret();
    this.jwtRefreshSecret = this.configService.getJwtRefreshSecret();
  }

  

  async login(loginDto: AuthForm): Promise<{ accessToken: string; refreshToken: string }> {
    const { username, password } = loginDto;

    // Шаг 1: Получение данных пользователя из Core_app
    const userResponse = await this.coreAppApiService.getUserByUsername(username);
    if (!userResponse) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const { password: passwordHash, ...userData } = userResponse;

    // Шаг 2: Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    // Шаг 3: Генерация токенов
    const accessToken = await this.generateAccessToken(userResponse.username);
    const refreshToken = await this.generateRefreshToken(userResponse.username);

    // Шаг 4: Сохранение токенов в базе данных
    await this.authRepository.saveRefreshToken(userResponse.username, refreshToken);

    return { accessToken, refreshToken };
  }


  async logout(userData: any) {
    // Ваш код для регистрации пользователя
    return
  }


  async updateRefreshToken(userData: any) {
    // Ваш код для регистрации пользователя
    return
  }

  async validateToken(userData: any) {
    // Ваш код для регистрации пользователя
    return
  }
  // Генерация Access Token для пользователя
  async generateAccessToken(username: string): Promise<string> {
    // Получаем данные пользователя через HTTP запрос в Core_app
    const user = await this.coreAppApiService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const payload = { userId: user.id, username: user.username, role: user.role }; 
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtAccessSecret, // Секретный ключ для Access Token
      expiresIn: '15m', // Время жизни токена, например, 15 минут
    });
    return accessToken
  }

  // Генерация Refresh Token для пользователя
  async generateRefreshToken(username: string): Promise<string> {
    // Получаем данные пользователя через HTTP запрос в Core_app
    const user = await this.coreAppApiService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const payload = { userId: user.id, username: user.username, role: user.role }; 
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtRefreshSecret, // Секретный ключ для Refresh Token
      expiresIn: '7d', // Время жизни refresh токена, например, 7 дней
    });
    return refreshToken
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
  // private async getUserByUsername(username: string) {
  //   try {
  //     const response = await this.coreAppApiService.getUserByUsername(username);
  //     return response; //
  //   } catch (error) {
  //     return null; // Если пользователь не найден или ошибка, возвращаем null
  //   }
  // }

  private async getUserFromCoreApp(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://core_app_url/users/private/${userId}`),
      );
      return response.data;
    } catch (error) {
      return null; // Если пользователь не найден или ошибка, возвращаем null
    }
  }

  // // Метод для хеширования refresh токенов (если нужно)
  // async hashRefreshToken(token: string): Promise<string> {
  //   return bcrypt.hash(token, 10);
  // }

  // // Метод для проверки хеша refresh токена (если нужно)
  // async verifyRefreshTokenHash(token: string, hash: string): Promise<boolean> {
  //   return bcrypt.compare(token, hash);
  // }

  async _generateHash(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash
}
}
