import { NestFactory } from '@nestjs/core';
import { FilesModule } from './files.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FilesModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Наименование сервиса в кубернетисе, нужен для установки связи
      port: 3695, // Порт который присвоил Jenkins
    }
  });

  const PORT = process.env.PORT || 3695;

  await app.listen();
  console.log(`Приложение Files запущено на порту ${PORT}`);
}
bootstrap();

