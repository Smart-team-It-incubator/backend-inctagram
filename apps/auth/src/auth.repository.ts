import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private httpService: HttpService,
    private readonly prisma: PrismaService
  ) { }

  // Сохранение Refresh Token в базе данных или Redis
  async saveRefreshToken(username: string, refreshToken: string): Promise<void> {
    try {
      //await this.prisma.refreshToken.create({ data: { username, refreshToken } });

    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
    return
  }
}
