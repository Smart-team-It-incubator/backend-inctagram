import { Controller, Post, Body, Get, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthForm } from '@app/shared-dto/dtos/auth-form.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: AuthForm) {
    try {
      const result = await this.authService.login(loginDto);
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('logout')
  async logout(@Body() userData: any) {
    return this.authService.logout(userData);
  }
  
  @Post('refresh-token')
  async updateRefreshToken(@Body() userData: any) {
    return this.authService.updateRefreshToken(userData);
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
  @ApiResponse({ status: 200, description: 'List of active sessions.', schema: {
    example: [
      { sessionId: 'session1', device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: '2024-12-13T12:00:00Z' },
      { sessionId: 'session2', device: 'Safari on Mac', ip: '192.168.1.2', lastActive: '2024-12-12T18:30:00Z' },
    ]
  }})
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
  

}
