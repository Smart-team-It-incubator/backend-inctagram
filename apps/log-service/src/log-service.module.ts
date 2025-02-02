import { Module } from '@nestjs/common';
import { LogController } from './log-service.controller';
import { LogService } from './log-service.service';

@Module({
  providers: [LogService],
  controllers: [LogController],
  exports: [LogService],
})
export class LogModule {}