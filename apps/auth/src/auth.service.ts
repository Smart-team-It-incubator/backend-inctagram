import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Импортируем firstValueFrom из RxJS
import { AuthForm } from '@app/shared-dto/dtos/auth-form.dto';
import { CustomConfigService } from '../../../libs/shared-dto/src/config-service';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { JwtPayload } from '@app/shared-dto/dtos/jwt-payload.dto';


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
    const { email, password } = loginDto;

    // Шаг 1: Получение данных пользователя из Core_app
    const userResponse = await this.coreAppApiService.getUserByEmail(email);
    if (!userResponse) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const { password: passwordHash } = userResponse;

    // Шаг 2: Проверка пароля, сравниваем hash с введенным паролем
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    // Шаг 3: Генерация токенов
    const accessToken = await this.generateAccessToken(userResponse.username);
    const refreshToken = await this.generateRefreshToken(userResponse.username);

    // Шаг 4: Удаление старых токенов
    await this.authRepository.deleteRefreshTokenByUserId(userResponse.id);

    // Шаг 5: Сохранение токенов в базе данных, для возможности дальнейшего отзыва токенов и проверки их валидности

    // Извлекаем Payload токена чтобы положить его в базу
    const refreshTokenPayload: JwtPayload = await this.extractPayloadFromToken(refreshToken, false);
    // Хешируем токен т.к напрямую хранить токен нельзя
    const hashRefreshToken = await this.hashRefreshToken(refreshToken);
    // Сохраняем токен в базе данных
    await this.authRepository.saveRefreshToken(userResponse.username, hashRefreshToken, refreshTokenPayload);

    return { accessToken, refreshToken };
  }


  async logout(refreshToken: string): Promise<void> {
    // Шаг 1: Извлекаем данные из токена
    const payload = this.jwtService.decode(refreshToken) as JwtPayload;

    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Шаг 2: Ищем сохранённые хеши токенов для пользователя
    const tokenHashes = await this.authRepository.getRefreshTokensByUserId(payload.userId);

    if (!tokenHashes || tokenHashes.length === 0) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Шаг 3: Сравниваем токен с каждым хешем
    let validHash: string | null = null;
    for (const hash of tokenHashes) {
      if (await bcrypt.compare(refreshToken, hash)) {
        validHash = hash;
        break;
      }
    }

    if (!validHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Шаг 4: Удаляем найденный хеш токена
    await this.authRepository.deleteRefreshTokenByHash(validHash);
  }


  // Метод для обновления уже существующего AccessToken на основании RefreshToken
  async updateRefreshToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    // Шаг 1: Извлекаем Payload и одновременно проверяем на валидность токен т.к внутри jwt.verify метод
    const refreshTokenPayload: JwtPayload = await this.extractPayloadFromToken(refreshToken, false);
    //console.log("refreshTokenPayload", refreshTokenPayload);
    if (!refreshTokenPayload || !refreshTokenPayload.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    //console.log("Проверка на истечение срока действия", Date.now() >= refreshTokenPayload.exp, refreshTokenPayload.exp, Math.floor(Date.now() / 1000));
    // Проверка на истечение срока действия, с приведениям к одной величине, для корректного сравнения
    if (Math.floor(Date.now() / 1000) >= refreshTokenPayload.exp) {
      throw new UnauthorizedException('Refresh token expired');
    }
    
    // Шаг 2: Удаление старых токенов
    await this.authRepository.deleteRefreshTokenByUserId(refreshTokenPayload.userId);
    
    // Шаг 3: Генерация новых токенов
    const accessToken = await this.generateAccessToken(refreshTokenPayload.username)
    const newRefreshToken = await this.generateRefreshToken(refreshTokenPayload.username);

    // Шаг 4: Хешируем токен т.к напрямую хранить токен нельзя
    const hashRefreshToken = await this.hashRefreshToken(refreshToken);
    // Сохраняем токен в базе данных
    await this.authRepository.saveRefreshToken(refreshTokenPayload.username, hashRefreshToken, refreshTokenPayload);

    return { accessToken, newRefreshToken };
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

  // Метод для хеширования refresh токенов (если нужно)
  async hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  // Метод для проверки хеша refresh токена (если нужно)
  async verifyRefreshToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  async _generateHash(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash
  }

  // Метод для извлечения payload из токена
  async extractPayloadFromToken(token: string, isAccessToken: boolean = true): Promise<any> {
    try {
      const secret = isAccessToken ? this.jwtAccessSecret : this.jwtRefreshSecret;
      const decoded = this.jwtService.verify(token, { secret });

      return new JwtPayload(decoded); // Создаём экземпляр класса - это необходимо для использования метода expirationDate
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

}
