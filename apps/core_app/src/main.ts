import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomValidationPipe } from './domain/exceptions/Pipe/Custom_global_validation_pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Глобальный префикс для всех эндпоинтов
  app.setGlobalPrefix('api/v1'); 

  // Подключение глобального пайпа для кастомизации и структурирования ошибок + проверки DTO которые приходят в контроллеры
  app.useGlobalPipes(
    new CustomValidationPipe(),
  );

  // Подключение Swagger для документации
  const config = new DocumentBuilder()
  .setTitle('Core_app API') // Укажи название API
  .setDescription('В API представлены методы для таких модулей как: Users, Posts, Auth, Files') // Добавь описание
  .setVersion('1.0') // Укажи версию
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/swagger', app, document); // Укажи путь к документации
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Приложение запущено на порту ${process.env.PORT} ?? 3000`);
}
bootstrap();