import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '@app/shared-dto/dtos/auth/jwt-payload.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthRepository {
  constructor(
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
      const sessionId = randomUUID(); // Генерация уникального sessionId
      const { userId, deviceId, expirationDate } = refreshTokenPayload;
  
      // Транзакция для работы с базой данных
      await this.prisma.$transaction([
        // Удаление старых сессий и токенов для пользователя и устройства
        this.prisma.deviceSession.deleteMany({
          where: { userId, deviceId },
        }),
        // Создание новой записи RefreshToken, связанной с Session
        this.prisma.deviceSession.create({
          data: {
            tokenHash: hashRefreshToken,
            userId,
            deviceId,
            expiresAt: expirationDate,
            revoked: false,
            userAgent: useragent,
            createdAt: new Date(),
            updatedAt: new Date(),
            ip: ip
          },
        }),
      ]);
  
      console.log('Токен и информация о сессии успешно сохранены.');
    } catch (error) {
      console.error('Ошибка при сохранении токена и сессии:', error);
      throw new Error('Ошибка транзакции при сохранении данных.');
    }
  }
  
  
  

  // Удаление токена по хешу (параллельно удаление сессии из-за связи таблиц) 
  async deleteRefreshTokenByHash(hashRefreshToken: string): Promise<boolean> {
    try {
      await this.prisma.deviceSession.deleteMany({
        where: { tokenHash: hashRefreshToken },
      });
      return true; // Токен и связанные записи успешно удалены
    } catch (error) {
      console.error('Ошибка при удалении токена:', error);
      return false;
    }
  }

  // Удаляем токены по UserId и TokenHash - так как TokenHash связать с Session таблицей, соответственно удалится и сессия тоже.
  async deleteRefreshTokenByUserId(userId: string, tokenHash: string): Promise<boolean> {
    try {
      const result = await this.prisma.deviceSession.deleteMany({
        where: {userId, tokenHash },
      });
  
      return true
    } catch (error) {
      console.error('Ошибка при удалении токена:', error);
      return false;
    }

  }

// Получение всех хешей токенов для пользователя с учетом deviceId сессии
  async getRefreshTokensByUserId(userId: string, deviceId: string): Promise<string[]> {
  const tokens = await this.prisma.deviceSession.findMany({
    where: {
      userId,
      deviceId: deviceId , // Используем связь с таблицей Session для фильтрации по deviceId
    },
    select: {
      tokenHash: true, // Извлекаем только хеши токенов
    },
  });

  return tokens.map((t) => t.tokenHash);
}

// Поиск одной конкретной сессии
async findOneActiveSession(userId: string, deviceId: string): Promise<object> {
  const sessions = await this.prisma.deviceSession.findFirst({
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
  const sessions = await this.prisma.deviceSession.findMany({
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
      const session = await this.prisma.deviceSession.delete({
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
    const result = await this.prisma.deviceSession.deleteMany({
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
      this.prisma.deviceSession.deleteMany({}),
      // Добавьте другие таблицы, из которых нужно удалить данные
    ]);
    console.log('Данные успешно удалены из таблиц Auth');
  } catch (error) {
    console.error('Ошибка при удалении данных:', error);
  }
}
}
