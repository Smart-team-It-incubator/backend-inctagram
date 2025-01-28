import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailConsumerService } from './email-consumer-service';
import { EmailProducerService } from './email-producer-service';
import { EmailAdapterService } from '../email-service.service';
import { TelegramService } from '../telegram-service';
import { RabbitMQInitializerService } from './rabbitMQInitService';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EMAIL_SERVICE', // Указываем имя клиента для инъекции
        transport: Transport.RMQ, // Используем RabbitMQ
        options: {
          urls: [process.env.RABBITMQ_URL], // URL RabbitMQ
          queue: 'email_queue', // Очередь
          queueOptions: {
            durable: true, // Очередь с долговечностью
            exclusive: false, // Очередь не будет ограничена только одним подключением
            autoDelete: false,  // Очередь не будет удалена автоматически
          },
        },
      },
    ]),
  ],
  controllers: [EmailConsumerService],
  providers: [RabbitMQInitializerService, EmailProducerService, EmailConsumerService, EmailAdapterService, TelegramService], // Убедитесь, что EmailAdapterService зарегистрирован
  exports: [ClientsModule, EmailProducerService, EmailConsumerService], // Экспортируем необходимые сервисы
})
export class RabbitMQModule {}
