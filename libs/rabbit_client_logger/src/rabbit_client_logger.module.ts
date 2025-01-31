import { Module } from '@nestjs/common';
import { RabbitClientLoggerService } from './rabbit_client_logger.service';

@Module({
  providers: [RabbitClientLoggerService],
  exports: [RabbitClientLoggerService],
})
export class RabbitClientLoggerModule {}
