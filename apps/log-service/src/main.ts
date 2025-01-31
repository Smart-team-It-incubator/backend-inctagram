import 'newrelic';  // Импортируем New Relic первым
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LogModule } from './log-service.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  // После того как конфигурация загружена, подключаем New Relic
  const { config } = await import('../../../newrelic.mjs'); // Загрузите конфигурацию, если нужно

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LogModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'log_queue',
      queueOptions: { durable: true, autoDelete: false },
    },
  });

  console.log('🚀 Log Microservice запущен...');
  await app.listen();
}
bootstrap();
