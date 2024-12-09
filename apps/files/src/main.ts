import { NestFactory } from '@nestjs/core';
import { FilesModule } from './files.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FilesModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.FILES_SERVICE_HOST || '0.0.0.0',
      port: Number(process.env.FILES_SERVICE_PORT) || 3695,
    }
  });

  const PORT = process.env.PORT || 3695;

  await app.listen();
  console.log(`Приложение Files запущено на порту ${PORT}`);
}
bootstrap();

