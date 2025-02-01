import * as dotenv from 'dotenv';
dotenv.config();
import 'newrelic';  // Импортируем New Relic первым
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LogModule } from './log-service.module';


async function bootstrap() {
  // После того как конфигурация загружена, подключаем New Relic
  const { config } = await import('../../../newrelic.js'); // Загрузите конфигурацию, если нужно
  console.log("Rabbit MQ URL",process.env.RABBITMQ_URL)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LogModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'log_queue',
      queueOptions: { durable: true, autoDelete: false },
      maxConnectionAttempts: 5,
    },
  });

  await app.listen();
  console.log('🚀 Log Microservice запущен...');
}
bootstrap();
