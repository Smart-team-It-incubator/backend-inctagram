import { Controller, Post, Body, Get, HttpStatus, HttpException, Res, HttpCode, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthForm } from '@app/shared-dto/dtos/auth-form.dto';

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
  @ApiCookieAuth() // Добавляем информацию о cookie для refreshToken
  async login(@Body() loginDto: AuthForm, @Res() res) {
    try {
      const result = await this.authService.login(loginDto);
      res
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true
        })
        .status(200)
        .send({ accessToken: result.accessToken });
    } catch (error) {
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
      const refreshToken = req.cookies?.refreshToken; // Получаем токен из Cookie
      //console.log("К нам пришел refresh token /auth/refresh-token:",refreshToken)
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }
      const { accessToken, newRefreshToken } = await this.authService.updateRefreshToken(refreshToken);
  
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

  @Post('validate-token')
  async validateToken(@Body() userData: any) {
    return this.authService.validateToken(userData);
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
  async getActiveSessions(): Promise<any[]> {
    // TODO: Implement logic to fetch active sessions
    return [
      { sessionId: 'session1', device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: '2024-12-13T12:00:00Z' },
      { sessionId: 'session2', device: 'Safari on Mac', ip: '192.168.1.2', lastActive: '2024-12-12T18:30:00Z' },
    ];
  }

  // Revoke Session
  @Post('sessions/revoke')
  @ApiResponse({ status: 200, description: 'Session revoked successfully.' })
  @ApiBody({ schema: { example: { sessionId: 'session1' } } })
  async revokeSession(@Body('sessionId') sessionId: string): Promise<{ message: string }> {
    // TODO: Implement logic to revoke a specific session
    return { message: `Session ${sessionId} revoked successfully.` };
  }

  // Revoke All Sessions
  @Post('sessions/revoke-all')
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully.' })
  async revokeAllSessions(): Promise<{ message: string }> {
    // TODO: Implement logic to revoke all sessions for the user
    return { message: 'All sessions revoked successfully.' };
  }

  @Post('hash-password')
  async hashPassword(@Body('password') passwordByUser: string): Promise<{ hashedPassword: string }> {
    console.log("мы попали в controller Auth hash-password", passwordByUser);
    const password = await this.authService._generateHash(passwordByUser);
    return password;
  }


}
