import { Module } from '@nestjs/common';
import { PrismaCoreAppService } from './prisma.service';


@Module({
  providers: [PrismaCoreAppService],
  exports: [PrismaCoreAppService], // Экспортируем сервис для других модулей
})
export class PrismaModule {}