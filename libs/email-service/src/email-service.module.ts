import { Module } from '@nestjs/common';
import { EmailAdapterService } from '.';
import { EmailConsumerService } from './rabbitMQ/email-consumer-service';
import { EmailProducerService } from './rabbitMQ/email-producer-service';

@Module({
  providers: [EmailAdapterService,EmailProducerService, EmailConsumerService],
  exports: [EmailAdapterService],
})
export class EmailServiceModule {}
