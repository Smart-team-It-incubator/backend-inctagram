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
import { randomUUID } from 'crypto';


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



  async login(loginDto: AuthForm, useragent: string, ip: string, refreshTokenExist?: string): Promise<{ accessToken: string; refreshToken: string }> {
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

    // Шаг 3: Проверка на случай, если к нам пришел запрос с уже существующим, действующим, Refresh Token - в таком случае отказываем в выдаче новой сессии, для обновления токенов есть отдельный метод
    const existRefreshTokenPayload: JwtPayload = await this.extractPayloadFromToken(refreshTokenExist, false);
    const existingSession = await this.authRepository.findActiveSession(userResponse.userId, existRefreshTokenPayload.deviceId);
    console.log("existingSession:", existingSession);
    if (existingSession) {
      throw new Error('Active session exists');
    }

    // Шаг 3: Генерация токенов
    const deviceId = randomUUID(); // Генерируем DeviceId перед вызовом функций, чтобы внутри access и refresh токенов лежал один deviceId 
    const accessToken = await this.generateAccessToken(userResponse.username, deviceId);
    const refreshToken = await this.generateRefreshToken(userResponse.username, deviceId);

    // Шаг 4: Сохранение токенов в базе данных, для возможности дальнейшего отзыва токенов и проверки их валидности
    // Извлекаем Payload токена чтобы положить его в базу
    const refreshTokenPayload: JwtPayload = await this.extractPayloadFromToken(refreshToken, false);
    // Хешируем токен т.к напрямую хранить токен нельзя
    const hashRefreshToken = await this.hashRefreshToken(refreshToken);
    // Сохраняем токен в базе данных + создаем сессию для этого токена (устройства)
    await this.authRepository.saveRefreshToken(userResponse.username, hashRefreshToken, refreshTokenPayload, useragent, ip);

    // Шаг 5: Удаление старых токенов c учетом сессии (hashRefreshToken выступает как связь)
    //await this.authRepository.deleteRefreshTokenByUserId(userResponse.id, hashRefreshToken);
    // Вопрос на подумать, нужно ли тут удалять что-либо

    return { accessToken, refreshToken };
  }


  async logout(refreshToken: string): Promise<void> {
    // Шаг 1: Извлекаем данные из токена
    const payload = this.jwtService.decode(refreshToken) as JwtPayload;

    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Шаг 2: Ищем сохранённые хеши токенов для пользователя с учетом сессии (deviceId)
    const tokenHashes = await this.authRepository.getRefreshTokensByUserId(payload.userId, payload.deviceId);

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

    // Шаг 4: Удаляем найденный хеш токена (параллельно удаление сессии из-за связи таблиц) 
    await this.authRepository.deleteRefreshTokenByHash(validHash);
  }


  // Метод для обновления уже существующего AccessToken на основании RefreshToken
  async updateRefreshToken(refreshToken: string, useragent: string, ip: string): Promise<{ accessToken: string; newRefreshToken: string }> {
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
    
    // Шаг 2: Ищем сохранённые хеши токенов для пользователя с учетом сессии (deviceId)
    const tokenHashes = await this.authRepository.getRefreshTokensByUserId(refreshTokenPayload.userId, refreshTokenPayload.deviceId);
    if (!tokenHashes || tokenHashes.length === 0) {
      throw new UnauthorizedException('Refresh token with the specified deviceId not found');
    }

    // Шаг 3: Удаление старых токенов
    await this.authRepository.deleteRefreshTokenByUserId(refreshTokenPayload.userId, tokenHashes[0]);
    
    // Шаг 4: Генерация новых токенов, с передачей уже существующего deviceId
    const accessToken = await this.generateAccessToken(refreshTokenPayload.username, refreshTokenPayload.deviceId)
    const newRefreshToken = await this.generateRefreshToken(refreshTokenPayload.username, refreshTokenPayload.deviceId);

    // Шаг 5: Хешируем токен т.к напрямую хранить токен нельзя
    const hashRefreshToken = await this.hashRefreshToken(refreshToken);
    // Сохраняем токен в базе данных
    await this.authRepository.saveRefreshToken(refreshTokenPayload.username, hashRefreshToken, refreshTokenPayload, useragent, ip);

    return { accessToken, newRefreshToken };
  }


  
  // Генерация Access Token для пользователя
  async generateAccessToken(username: string, deviceId: string): Promise<string> {
    // Получаем данные пользователя через HTTP запрос в Core_app
    const user = await this.coreAppApiService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const payload = { userId: user.id, username: user.username, role: user.role, deviceId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtAccessSecret, // Секретный ключ для Access Token
      expiresIn: '15m', // Время жизни токена, например, 15 минут
    });
    return accessToken
  }

  // Генерация Refresh Token для пользователя
  async generateRefreshToken(username: string, deviceId: string): Promise<string> {
    // Получаем данные пользователя через HTTP запрос в Core_app
    const user = await this.coreAppApiService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const payload = { userId: user.id, username: user.username, role: user.role, deviceId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtRefreshSecret, // Секретный ключ для Refresh Token
      expiresIn: '7d', // Время жизни refresh токена, например, 7 дней
    });
    return refreshToken
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


  async dropDb() {
    return this.authRepository.dropDb();
  }

}
