import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';  // Для преобразования Observable в Promise
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private httpService: HttpService,
    private readonly prisma: PrismaService
  ) { }

  // Сохранение Refresh Token в базе данных или Redis
  async saveRefreshToken(username: string, refreshToken: string): Promise<void> {
    // try {
    //   await prisma.refreshToken.create({ data: { username, refreshToken } });
    //   console.log(response.data); // Выводим ответ от Core_app в консоль
    // } catch (error) {
    //   console.error('Error saving refresh token:', error);
    // }
    return
  }
}
