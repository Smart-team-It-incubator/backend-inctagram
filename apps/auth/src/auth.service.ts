import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Импортируем firstValueFrom из RxJS
import { AuthForm } from '@app/shared-dto/dtos/auth/auth-form.dto';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { JwtPayload } from '@app/shared-dto/dtos/auth/jwt-payload.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { EmailAdapterService } from '@app/email-service';
const { v4: uuidv4 } = require('uuid');


@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly coreAppApiService: CoreAppApiService,
    private readonly emailAdapterService: EmailAdapterService
  ) {
  }



  async login(loginDto: AuthForm, useragent: string, ip: string, refreshTokenExist?: string,): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;
    //console.log("Тесты LOGIN DTO", loginDto)
    // Шаг 1: Получение данных пользователя из Core_app
    const userResponse = await this.coreAppApiService.getUserByEmail(email);
    if (!userResponse) {
      throw new HttpException({message: 'User with this email not found', field: "email"}, HttpStatus.UNAUTHORIZED);
    }

    // Шаг 1.1: Проверка email на подтверждение, в случае если это Github запрос то Email автоматически подтверждается
    if (!userResponse.isEmailConfirmed && !loginDto.isGithubRequest) {
      throw new HttpException({message: 'Email not confirmed, check your email or use resending method', field: "email"}, HttpStatus.UNAUTHORIZED);
    }

    const { password: passwordHash } = userResponse;

    // Шаг 2: Проверка пароля, сравниваем hash с введенным паролем, но только если он не через Гитхаб
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid && !loginDto.isGithubRequest) {
      throw new HttpException({message: 'The email or password are incorrect try again please', field: "password"}, HttpStatus.UNAUTHORIZED);
    }


    // Шаг 4: Проверка на случай, если к нам пришел запрос с уже существующим, действующим, Refresh Token - в таком случае отказываем в выдаче новой сессии, для обновления токенов есть отдельный метод
    if (refreshTokenExist) {
      const existRefreshTokenPayload: JwtPayload = await this.extractPayloadFromToken(refreshTokenExist, false);
      const existingSession = await this.authRepository.findOneActiveSession(userResponse.userId, existRefreshTokenPayload?.deviceId);
      //console.log("existingSession:", existingSession);
      if (existingSession) {
        throw new HttpException({message: 'Active session exists, if you want to update, please use refresh-token'}, HttpStatus.BAD_REQUEST);
      }
    }

    // Шаг 5: Генерация токенов
    const deviceId = randomUUID(); // Генерируем DeviceId перед вызовом функций, чтобы внутри access и refresh токенов лежал один deviceId 
    const accessToken = await this.generateAccessToken(userResponse.username, deviceId);
    const refreshToken = await this.generateRefreshToken(userResponse.username, deviceId);

    // Шаг 6: Сохранение токенов в базе данных, для возможности дальнейшего отзыва токенов и проверки их валидности
    // Извлекаем Payload токена чтобы положить его в базу
    const refreshTokenPayload: JwtPayload = await this.extractPayloadFromToken(refreshToken, false);
    // Хешируем токен т.к напрямую хранить токен нельзя
    const hashRefreshToken = await this.hashRefreshToken(refreshToken);
   
    // Сохраняем токен в базе данных + создаем сессию для этого токена (устройства)
    await this.authRepository.saveRefreshToken(userResponse.username, hashRefreshToken, refreshTokenPayload, useragent, ip);

    // Шаг 7: Удаление старых токенов c учетом сессии (hashRefreshToken выступает как связь)
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
      throw new HttpException({message: 'User not found'}, HttpStatus.NOT_FOUND);
    }
    const payload = { userId: user.id, username: user.username, role: user.role, deviceId };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET, // Секретный ключ для Access Token
      expiresIn: '15m', // Время жизни токена, например, 15 минут
    });
    return accessToken
  }

  // Генерация Refresh Token для пользователя
  async generateRefreshToken(username: string, deviceId: string): Promise<string> {
    // Получаем данные пользователя через HTTP запрос в Core_app
    const user = await this.coreAppApiService.getUserByUsername(username);
    if (!user) {
      throw new HttpException({message: 'User not found'}, HttpStatus.NOT_FOUND);
    }
    const payload = { userId: user.id, username: user.username, role: user.role, deviceId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET, // Секретный ключ для Refresh Token
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

  async _generateHash(password: string): Promise<string> {
    try {
      const hash = bcrypt.hash(password, 10);
      return hash
    } catch (error) {
      console.error("Error in generateHash:", error.message);
      throw new Error("Hashing failed");
    }

  }

  // Метод для извлечения payload из токена
  async extractPayloadFromToken(token: string, isAccessToken: boolean = true): Promise<any> {
    try {
      const secret = isAccessToken ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
      const decoded = this.jwtService.verify(token, { secret });

      return new JwtPayload(decoded); // Создаём экземпляр класса - это необходимо для использования метода expirationDate
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }


  async dropDb() {
    return this.authRepository.dropDb();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////

  async getActiveSessions(refreshToken: string): Promise<object> {
    const refreshTokenPayload = await this.extractPayloadFromToken(refreshToken, false);
    const activeSessions = await this.authRepository.findAllActiveSession(refreshTokenPayload.userId);
    return activeSessions
  }

  async revokeSessionBySessionId(sessionId: string): Promise<boolean> {
    const result = await this.authRepository.revokeSessionBySessionId(sessionId);
    return result
  }

  async revokeAllActiveSessions(refreshToken: string): Promise<boolean> {
    const refreshTokenPayload = await this.extractPayloadFromToken(refreshToken, false);
    const result = await this.authRepository.revokeAllActiveSession(refreshTokenPayload.userId, refreshTokenPayload.deviceId);
    return result
  }

  async sendPasswordRecoveryMessage (userEmail: string) {
    // Ищем пользователя, существует ли он вообще
    const userByEmail = await this.coreAppApiService.getUserByEmail(userEmail);
    if (userByEmail) {
      try {
        const recoveryCode = uuidv4();
      // Создаем для юзера код восстановления + срок по которому можем определить актуальность этого запроса
      const userUpdate = await this.coreAppApiService.updateUser(userByEmail.id, {resetPasswordToken: recoveryCode, resetPasswordExpires: new Date(Date.now() + 300000)}); // 5 минут
      // Отправляем письмо
      console.log("userUpdate", userUpdate)
      return this.emailAdapterService.sendPasswordRecoveryMessage(userEmail, recoveryCode)
      } catch (error) {
        console.log("Что-то произошло при отправке письма для восстановления пароля", error)
      }
    }
    else {
      console.log("userEmail",  userEmail)
      console.log("Попали в смену пароля и пользователь не найден")
      throw new HttpException({message: 'User not found when try sending password recovery message'}, HttpStatus.NOT_FOUND);
    }
    
  }

  async resetPassword (recoveryCode: string, newPassword: string) {
    // Ищем пользователя по коду восстановления
    const userByResetPasswordToken = await this.coreAppApiService.getUserByResetPasswordToken(recoveryCode);
    if (userByResetPasswordToken.resetPasswordExpires < new Date()) {
      throw new HttpException({message: 'Recovery code expired', field: "recoveryCode"}, HttpStatus.BAD_REQUEST);
    }
    //console.log(userByResetPasswordToken)
    if (userByResetPasswordToken) {
      const hashedPassword = await this._generateHash(newPassword);
      const userUpdate = await this.coreAppApiService.updateUser(userByResetPasswordToken.id, {password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null});
      return userUpdate
    }
    else {
      throw new HttpException({message: 'User not found or recovery code invalid'}, HttpStatus.NOT_FOUND);
    }
  }
  async changePassword (oldPassword: string, newPassword: string, username: string) {
    const user = await this.coreAppApiService.getUserByUsername(username);
    if (!user) {
      throw new HttpException({message: 'User not found by username (token is invalid)'}, HttpStatus.NOT_FOUND);
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new HttpException({message: 'Old password is incorrect'}, HttpStatus.UNAUTHORIZED);
    }
    const hashedPassword = await this._generateHash(newPassword);
    const userUpdate = await this.coreAppApiService.updateUser(user.id, {password: hashedPassword});
    return userUpdate
  }
}
