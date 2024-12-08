import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1'); 

  const config = new DocumentBuilder()
  .setTitle('Core_app API') // Укажи название API
  .setDescription('В API представлены методы для таких модулей как: Users, Posts, Auth') // Добавь описание
  .setVersion('1.0') // Укажи версию
  .addBearerAuth() // Если используешь авторизацию, добавь её
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // Укажи путь к документации
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Приложение запущено на порту ${process.env.PORT} ?? 3000`);
}
bootstrap();
