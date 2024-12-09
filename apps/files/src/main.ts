import { NestFactory } from '@nestjs/core';
import { FilesModule } from './files.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FilesModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // тут ОБЯЗАТЕЛЬНО 0.0.0.0 иначе внутри контейнеров связи не будет
      port: Number(process.env.FILES_SERVICE_PORT_ENV) || 3695,
    }
  });

  const PORT = process.env.PORT || 3695;

  await app.listen();
  console.log(`Приложение Files запущено на порту ${PORT}`);
}
bootstrap();

