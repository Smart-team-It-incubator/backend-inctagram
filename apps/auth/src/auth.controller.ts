import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: { username: string, password: string }) {
    return this.authService.login(credentials.username, credentials.password);
  }

  @Post('register')
  async register(@Body() userData: any) {
    return this.authService.register(userData);
  }
}
