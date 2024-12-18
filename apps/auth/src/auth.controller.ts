import { Controller, Post, Body, Get, HttpStatus, HttpException, Res, HttpCode, Req, UnauthorizedException, Delete, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthForm } from '@app/shared-dto/dtos/auth-form.dto';
import { Session } from '@prisma/auth';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
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
  @ApiCookieAuth() // Добавляем информацию о cookie для refreshToken
  async login(@Body() loginDto: AuthForm, @Res() res, @Req() req) {
    try {
      const ip = req.ip
      const useragent = req.headers['user-agent'];
      const refreshTokenExist = req.cookies?.refreshToken; // Получаем токен из Cookie
      const result = await this.authService.login(loginDto, useragent, ip, refreshTokenExist);
      
      res
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true
        })
        .status(200)
        .send({ accessToken: result.accessToken });
    } catch (error) {
      if (error.message === 'Active session exists') {
        throw new HttpException('Уже существует активная сессия для устройства с этим Refresh Token, если нужно обновить, обратись на refresh-token.', HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiTags('Auth') // Группировка методов по тегу 'Auth'
  @Post('logout')
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
    //console.log(req.cookies)

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    await this.authService.logout(refreshToken); // Обработка Logout на уровне сервиса

    return { message: 'Logout successful' };
  }

  
  // Обновляем Access Token на основании Refresh token
  @ApiTags('Auth') // Группировка методов по тегу 'Auth'
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
  @Post('refresh-token')
  async updateRefreshToken(@Req() req, @Res() res) {
    try {
      const ip = req.ip
      const useragent = req.headers['user-agent'];
      const refreshToken = req.cookies?.refreshToken; // Получаем токен из Cookie
      //console.log("К нам пришел refresh token /auth/refresh-token:",refreshToken)
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }
      const { accessToken, newRefreshToken } = await this.authService.updateRefreshToken(refreshToken, useragent, ip);
  
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true, // включить в продакшене
        //sameSite: 'strict',
        //path: '/auth/refresh',
      });
      res.json({ accessToken });

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }


  @Post('password-reset/request')
  @ApiResponse({ status: 200, description: 'Password reset request submitted successfully.' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  async requestPasswordReset(@Body('email') email: string): Promise<{ message: string }> {
    // TODO: Implement logic for sending password reset email
    return { message: `Password reset link sent to ${email}` };
  }

  // Reset Password
  @Post('password-reset/confirm')
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiBody({ schema: { example: { resetToken: 'token123', newPassword: 'newStrongPassword' } } })
  async resetPassword(
    @Body('resetToken') resetToken: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    // TODO: Implement logic for resetting the password
    return { message: 'Password reset successful.' };
  }

  // Change Password
  @Post('password/change')
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiBody({ schema: { example: { currentPassword: 'oldPassword123', newPassword: 'newStrongPassword' } } })
  async changePassword(
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    // TODO: Implement logic for changing the password
    return { message: 'Password changed successfully.' };
  }

  // Get Active Sessions
  @Get('sessions')
  @ApiResponse({
    status: 200, description: 'List of active sessions.', schema: {
      example: [
        { sessionId: 'session1', device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: '2024-12-13T12:00:00Z' },
        { sessionId: 'session2', device: 'Safari on Mac', ip: '192.168.1.2', lastActive: '2024-12-12T18:30:00Z' },
      ]
    }
  })
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
  @Delete('sessions/revoke/:sessionId')
  @ApiResponse({ status: 200, description: 'Session revoked successfully.' })
  @ApiBody({ schema: { example: { sessionId: 'session1' } } })
  async revokeSession(@Param('sessionId') sessionId: string): Promise<{ message: string }> {
    try {
      console.log(sessionId)
      const result = await this.authService.revokeSessionBySessionId(sessionId);
      if (!result) throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      return { message: `Session ${sessionId} revoked successfully.` };
    } catch (error) {
      // Обрабатываем ошибку, чтобы не возвращать 200
      throw error; // Повторно выбрасываем ошибку для корректной обработки HTTP статуса
    }
  }

  // Revoke All Sessions
  @Delete('sessions/revoke-all')
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully.' })
  async revokeAllSessions(@Req() req): Promise<{ message: string }> {
    try {
      const refreshToken = req.cookies?.refreshToken; // Получаем токен из Cookie
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }
      const result: boolean = await this.authService.revokeAllActiveSessions(refreshToken);
      if (!result) throw new HttpException('Active sessions not found', HttpStatus.NOT_FOUND);
      return { message: 'All sessions revoked successfully.' };
    } catch (error) {
      // Обрабатываем ошибку, чтобы не возвращать 200
      throw error; // Повторно выбрасываем ошибку для корректной обработки HTTP статуса
    }
    
  }

  @Post('hash-password')
  async hashPassword(@Body('password') passwordByUser: string): Promise<{ hashedPassword: string }> {
    try {
      console.log("мы попали в controller Auth hash-password", passwordByUser);
      const password = await this.authService._generateHash(passwordByUser);
      return password;
    } catch (error) {
      return error.message
    }

  }

  // For Dev
  @Delete('drop-db')
  async dropDb() {
    return this.authService.dropDb();
  }
}
