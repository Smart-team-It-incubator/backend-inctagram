import { Controller, Post, Body, Get, HttpStatus, HttpException, Res, HttpCode, Req, UnauthorizedException, Delete, Query, Param, Ip, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthForm } from '@app/shared-dto/dtos/auth/auth-form.dto';
import { EmailAdapterService } from '@app/email-service';
import { RecaptchaAdapter } from './utils/recaptcha_adapter';
import { JwtAuthGuard } from '@app/guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
      private readonly emailService: EmailAdapterService,
      private readonly recaptchaAdapter: RecaptchaAdapter
  ) { }


  @Post('/login')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({
    description: 'Данные для авторизации',
    type: AuthForm, // DTO для тела запроса
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация. Возвращает accessToken и устанавливает refreshToken в cookie.',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Токен для доступа (JWT)',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Ошибка авторизации. Неверный логин или пароль.',
  })
  @ApiResponse({
    status: 409,
    description: 'Сессия уже существует для этого устройства.',
  })
  async login(@Body() loginDto: AuthForm, @Res() res, @Req() req) {
    try {
      //console.log("Попадание в Login")
      const ip = req.ip
      const useragent = req.headers['user-agent'];
      const refreshTokenExist = req.cookies?.refreshToken; // Получаем токен из Cookie
      const result = await this.authService.login(loginDto, useragent, ip, refreshTokenExist);
      //console.log(result.refreshToken)
      res
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: process.env.HTTP_ONLY,
          secure: process.env.NODE_ENV === 'PRODUCTION',
          domain: '.smart-reg.org.ru', // Указывает основной домен и включает все субдомены
          //maxAge: 24 * 60 * 60 * 1000, // Время жизни
          //sameSite: 'Strict', // Или 'Lax' в зависимости от вашего случая
        })
        .status(200)
        .send({ accessToken: result.accessToken });
    } catch (error) {
      if (error.message === 'Active session exists, if you want to update, please use refresh-token') {
        throw new HttpException({message: 'Уже существует активная сессия для устройства с этим Refresh Token, если нужно обновить, обратись на refresh-token.'}, HttpStatus.CONFLICT);
      }
      // Здесь возвращаем Error.response, так как ошибка происходит на уровне сервиса и важно передать весь объект
      throw new HttpException(error.response, HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiTags('Auth') // Группировка методов по тегу 'Auth'
  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user', 
    description: 'Handles logout by invalidating the refresh token and logging the user out.'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: { message: 'Logout successful' }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token not found',
    schema: {
      example: { message: 'Refresh token not found' }
    }
  })
  @HttpCode(HttpStatus.OK) // Устанавливаем код 200 для успешного выхода
  async logout(@Req() req) {
    const refreshToken = req.cookies?.refreshToken; // Получаем токен из Cookie
    ////console.log(req.cookies)

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    await this.authService.logout(refreshToken); // Обработка Logout на уровне сервиса

    return { message: 'Logout successful' };
  }

  
  // Обновляем Access Token на основании Refresh token
  @ApiOperation({
    summary: 'Update AccessToken using RefreshToken', 
    description: 'This endpoint updates the AccessToken by using the RefreshToken from the cookie and returns a new AccessToken along with a new RefreshToken in the cookie.'
  })
  @ApiResponse({
    status: 200,
    description: 'Access token successfully refreshed',
    schema: {
      example: { accessToken: 'newAccessToken' }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      example: { message: 'Invalid or expired refresh token' }
    }
  })
  @Post('/refresh-token')
  @ApiCookieAuth('refreshToken')
  async updateRefreshToken(@Req() req, @Res() res) {
    try {
      const ip = req.ip
      const useragent = req.headers['user-agent'];
      const refreshToken = req.cookies?.refreshToken; // Получаем токен из Cookie
      ////console.log("К нам пришел refresh token /auth/refresh-token:",refreshToken)
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }
      const { accessToken, newRefreshToken } = await this.authService.updateRefreshToken(refreshToken, useragent, ip);
  
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: process.env.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'PRODUCTION',
        domain: '.smart-reg.org.ru', // Указывает основной домен и включает все субдомены
        //sameSite: 'strict',
        //path: '/auth/refresh',
      });
      res.json({ accessToken });

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }


  // Метод для запроса сброса пароля, не делает каких-либо изменений, просто отправляем письмо для восстановления
  @Post('/password-reset/request')
  @ApiOperation({ summary: 'Request password reset', description: 'Sends a password reset email to the specified user email address.' })
  @ApiResponse({ status: 200, description: 'Password reset request submitted successfully.' })
  @ApiResponse({ status: 404, description: 'User with the provided email not found.' })
  @ApiBody({
    schema: {
      example: { email: 'user@example.com' },
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
    },
  })
  async requestPasswordReset(@Body('email') email: string): Promise<{ message: string }> {
    // TODO: Implement logic for sending password reset email
    const result = await this.authService.sendPasswordRecoveryMessage(email)
    return { message: `Password reset link sent to ${email}` };
  }

  // Метод для взаимодействия с сбросом пароля из почтовой ссылки
  @Post('/password-reset/confirm')
  @ApiOperation({ summary: 'Reset password', description: 'Confirms password reset using a recovery code and sets a new password.' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired recovery code.' })
  @ApiBody({
    schema: {
      example: {
        recoveryCode: 'token123',
        newPassword: 'newStrongPassword',
      },
      type: 'object',
      properties: {
        recoveryCode: { type: 'string', example: 'token123' },
        newPassword: { type: 'string', example: 'newStrongPassword', minLength: 8 },
      },
    },
  })
  async resetPassword(
    @Query('recoveryCode') recoveryCode: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    //console.log("recoveryCode:",recoveryCode, "newPassword:",newPassword)
    const result = await this.authService.resetPassword(recoveryCode, newPassword)
    if (!result) {
      // Если результат отсутствует, токен может быть недействительным или истёкшим
      throw new HttpException({ message:'Invalid or expired recovery code.'}, HttpStatus.BAD_REQUEST);
    }
  
    // Возвращаем успешное сообщение
    return { message: 'Password reset successful.' };
  }

  // Change Password
  @Post('/password/change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid current password or other error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized, user not authenticated.' })
  @ApiBody({
    schema: {
      example: {
        currentPassword: 'oldPassword123',
        newPassword: 'newStrongPassword',
      },
    },
  })
  @ApiOperation({ summary: 'Reset password for authenticated user', description: 'Сброс пароля для авторизованного пользователя' })
  async changePassword(
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Req() req, // В Req приходят данные о пользователе благодаря Guard
  ): Promise<{ message: string }> {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user || !req.user.username) {
      throw new HttpException({message: 'Unauthorized: User is not authenticated.'}, HttpStatus.UNAUTHORIZED);
    }
  
    const username = req.user.username;
  
    // Изменение пароля
    const result = await this.authService.changePassword(currentPassword, newPassword, username);
  
    if (!result) {
      throw new HttpException({message:'Invalid current password or unable to change password.', field: "password"}, HttpStatus.BAD_REQUEST);
    }
  
    return { message: 'Password changed successfully.' };
  }
  

  // Get Active Sessions
  @Get('/sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Получения всех сессий пользователя', 
    description: 'Получение всех сессий пользователя на основе RefreshToken'
  })
  @ApiResponse({
    status: 200, description: 'List of active sessions.', schema: {
      example: [
        { sessionId: 'session1', device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: '2024-12-13T12:00:00Z' },
        { sessionId: 'session2', device: 'Safari on Mac', ip: '192.168.1.2', lastActive: '2024-12-12T18:30:00Z' },
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized, user not authenticated.' })
  async getActiveSessions(@Req() req): Promise<object> {
    try {
      const refreshToken = req.cookies?.refreshToken; // Получаем токен из Cookie
      const activeSessions = await this.authService.getActiveSessions(refreshToken);
      return activeSessions
    } catch (error) {
      return error.message
    }
  }

  // Revoke specific Session
  @Delete('/sessions/revoke/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Отзыв конкретной сессии', 
    description: 'Отзыв конкретной сессии пользователя по session ID'
  })
  @ApiResponse({ status: 200, description: 'Session revoked successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized, user not authenticated.' })
  @ApiBody({ schema: { example: { sessionId: 'session1' } } })
  async revokeSession(@Param('sessionId') sessionId: string): Promise<{ message: string }> {
    try {
      const result = await this.authService.revokeSessionBySessionId(sessionId);
      if (!result) throw new HttpException({message: 'Session not found'}, HttpStatus.NOT_FOUND);
      return { message: `Session ${sessionId} revoked successfully.` };
    } catch (error) {
      // Обрабатываем ошибку, чтобы не возвращать 200
      throw error; // Повторно выбрасываем ошибку для корректной обработки HTTP статуса
    }
  }

  // Revoke All Sessions
  @Delete('/sessions/revoke-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Отзыв всех сессий за исключением текущей', 
  })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized, user not authenticated.' })
  async revokeAllSessions(@Req() req): Promise<{ message: string }> {
    try {
      const refreshToken = req.cookies?.refreshToken; // Получаем токен из Cookie
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }
      const result: boolean = await this.authService.revokeAllActiveSessions(refreshToken);
      if (!result) throw new HttpException({message: 'Active sessions not found'}, HttpStatus.NOT_FOUND);
      return { message: 'All sessions revoked successfully.' };
    } catch (error) {
      // Обрабатываем ошибку, чтобы не возвращать 200
      throw error; // Повторно выбрасываем ошибку для корректной обработки HTTP статуса
    }
    
  }
  @ApiExcludeEndpoint()
  @Post('/hash-password')
  async hashPassword(@Body('password') passwordByUser: string): Promise<string> {
    try {
      //console.log("мы попали в controller Auth hash-password", passwordByUser);
      const password = await this.authService._generateHash(passwordByUser);
      return password;
    } catch (error) {
      return error.message
    }

  }

  // For Dev
  @ApiExcludeEndpoint()
  @Delete('/drop-db')
  async dropDb() {
    return this.authService.dropDb();
  }
  @ApiOperation({ summary: 'Проверка модуля Auth на работоспособность' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'status: ok, app is available' }) 
  @Get('/health') 
  async heath() {
    return {"status": "ok, app is available"}
  }
  
  // Метод для ручной проверки отправки Email-Сообщений
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Возможность отправить Email сообщение пользователю вручную, только для разработчиков' }) // Описание эндпоинта
  @Post('/send')
  async sendEmail(@Body() body: { to: string; subject: string; text: string }) {
    return this.emailService.sendEmail(body.to, body.subject, body.text);
  }

  @ApiOperation({ summary: 'Terms of Service' }) // Описание эндпоинта
  @Get('/terms')
  async termOfService() {
   return "Условия предоставления услуг"
  }

  @ApiOperation({ summary: 'Private Policy' }) // Описание эндпоинта
  @Get('/private')
  async PrivatePolicy(
  ) {
   return "Политика конфиденциальности"
  }

  
  @ApiOperation({ summary: 'Private Policy' }) // Описание эндпоинта
  @Post('/recaptcha')
  async exampleRecaptcha(
    @Body('token') tokenRecaptcha: string, 
    @Ip() remoteIp: string
  ) {
    //Это метод для Recaptcha
    //console.log("Я token из рекапчи:", tokenRecaptcha)
    const isValid = await this.recaptchaAdapter.validateToken(tokenRecaptcha, remoteIp);
    if (!isValid) {
      throw new HttpException({message:'Invalid reCAPTCHA token'}, HttpStatus.BAD_REQUEST);
    }
   return "Политика конфиденциальности"
  }
}
