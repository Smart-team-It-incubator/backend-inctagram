import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '@app/shared-dto/dtos/jwt-payload.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthRepository {
  constructor(private httpService: HttpService,
    private readonly prisma: PrismaService,
  ) { }

  // Сохранение Refresh Token в базе данных или Redis
  async saveRefreshToken(
    username: string,
    hashRefreshToken: string,
    refreshTokenPayload: JwtPayload,
    useragent: string,
    ip: string
  ): Promise<void> {
    try {
      const sessionId = randomUUID();; // Генерация уникального deviceId
      const { userId, deviceId } = refreshTokenPayload;

      await this.prisma.$transaction([
        // Удаляем старые сессии и токены если они есть
        this.prisma.session.deleteMany({
          where: {
            userId, deviceId
          },
        }),
        // Создаем запись в Session
        this.prisma.session.create({
          data: {
            id: sessionId,                   // Уникальный ID для сессии
            userId: refreshTokenPayload.userId,
            deviceId: refreshTokenPayload.deviceId,             // deviceId совпадает с id для примера
            ip,                              // IP-адрес устройства
            tokenHash: hashRefreshToken,     // Хэш токена
            expiresAt: refreshTokenPayload.expirationDate,
            createdAt: new Date(),
            lastVisit: new Date(),
          },
        }),
  
        // Создаем запись в RefreshToken
         this.prisma.refreshToken.create({
          data: {
            username,
            tokenHash: hashRefreshToken,      // Связываем сессии через tokenHash
            userId: refreshTokenPayload.userId,
            expiresAt: refreshTokenPayload.expirationDate,
            revoked: false,
            userAgent: useragent,             // User-Agent устройства
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      ]);
      console.log("Токен и информация о сессии сохранена в базу данных путем транзакции");
    } catch (error) {
      console.error('Error saving refresh token and session:', error);
      throw new Error('Transaction failed');
    }
  }

  // Удаление токена по хешу (параллельно удаление сессии из-за связи таблиц) 
  async deleteRefreshTokenByHash(hashRefreshToken: string,): Promise<boolean> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { tokenHash: hashRefreshToken},
    });

    return result.count > 0; // Удалено хотя бы одно совпадение
  }

  // Удаляем токены по UserId и TokenHash - так как TokenHash связать с Session таблицей, соответственно удалится и сессия тоже.
  async deleteRefreshTokenByUserId(userId: string, tokenHash: string): Promise<boolean> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId: userId, tokenHash: tokenHash},
    });

    return result.count > 0; // Удалено хотя бы одно совпадение
  }

// Получение всех хешей токенов для пользователя с учетом deviceId сессии
  async getRefreshTokensByUserId(userId: string, deviceId: string): Promise<string[]> {
  const tokens = await this.prisma.refreshToken.findMany({
    where: {
      userId,
      session: { deviceId }, // Используем связь с таблицей Session для фильтрации по deviceId
    },
    select: {
      tokenHash: true, // Извлекаем только хеши токенов
    },
  });

  return tokens.map((t) => t.tokenHash);
}

// Поиск одной конкретной сессии
async findOneActiveSession(userId: string, deviceId: string): Promise<object> {
  const sessions = await this.prisma.session.findFirst({
    where: {
      userId, 
      deviceId,
      expiresAt: {
        gt: new Date(),
      }
    }

    
  })
  return sessions
}

async findAllActiveSession(userId: string): Promise<object> {
  const sessions = await this.prisma.session.findMany({
    where: {
      userId, 
      expiresAt: {
        gt: new Date(),
      }
    }
  })
  if (!sessions) return null
  return sessions
}


  async revokeSessionBySessionId(sessionId: string): Promise<boolean> {

    try {
      const session = await this.prisma.session.delete({
        where: {
          id: sessionId,
        },
      });
  
      // Если удаление успешно, `session` содержит удаленную запись
      return !!session;
    } catch (error) {
      console.error('Error revoking session:', error);
      return false; // Если удаление не удалось
    }
}
async revokeAllActiveSession(userId: string, deviceId: string): Promise<boolean> {
  try {
    const result = await this.prisma.session.deleteMany({
      where: {
        userId, // Удаляем только сессии пользователя
        deviceId: {
          not: deviceId, // Исключаем указанное устройство
        },
        expiresAt: {
          gt: new Date(), // Только активные сессии
        },
      },
    });

    // `result.count` содержит количество удаленных записей
    return result.count > 0;
  } catch (error) {
    return false; // Если удаление не удалось
  }
}













async dropDb() {
  try {
    // Удаляем данные из каждой таблицы, но структура остаётся
    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({}),
      this.prisma.session.deleteMany({}),
      this.prisma.passwordResetRequest.deleteMany({}),
      this.prisma.revokedToken.deleteMany({}),
      // Добавьте другие таблицы, из которых нужно удалить данные
    ]);
    console.log('Данные успешно удалены из таблиц.');
  } catch (error) {
    console.error('Ошибка при удалении данных:', error);
  }
}
}
