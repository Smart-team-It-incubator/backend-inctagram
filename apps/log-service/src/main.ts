import 'newrelic';  // Импортируем New Relic перед любыми другими импортами
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LogModule } from './log-service.module';
import * as dotenv from 'dotenv';
dotenv.config();


async function bootstrap() {
  console.log(process.env.RABBITMQ_URL);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LogModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'log_queue',
      queueOptions: { durable: true },
    },
  });

  console.log('🚀 Log Microservice запущен...');
  await app.listen();
}
bootstrap();