import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '@app/shared-dto/dtos/jwt-payload.dto';

@Injectable()
export class AuthRepository {
  constructor(private httpService: HttpService,
    private readonly prisma: PrismaService
  ) { }

  // Сохранение Refresh Token в базе данных или Redis
  async saveRefreshToken(username: string, hashRefreshToken: string, refreshTokenPayload: JwtPayload): Promise<void> {
    try {
      await this.prisma.refreshToken.create({ data: { username, tokenHash: hashRefreshToken, userId: refreshTokenPayload.userId, expiresAt: refreshTokenPayload.expirationDate, revoked: false, createdAt: new Date(), updatedAt: new Date()  } });

    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
    return;
  }

  // Удаление токена по хешу
  async deleteRefreshTokenByHash(hashRefreshToken: string): Promise<boolean> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { tokenHash: hashRefreshToken},
    });

    return result.count > 0; // Удалено хотя бы одно совпадение
  }

  async deleteRefreshTokenByUserId(userId: string): Promise<boolean> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId: userId},
    });

    return result.count > 0; // Удалено хотя бы одно совпадение
  }

  // Получение всех хешей токенов для пользователя
  async getRefreshTokensByUserId(userId: string): Promise<string[]> {
  const tokens = await this.prisma.refreshToken.findMany({
    where: { userId },
    select: { tokenHash: true }, // Извлекаем только хеши токенов
  });
  return tokens.map((t) => t.tokenHash);
}
}
