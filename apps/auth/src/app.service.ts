import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './app.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
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
}
