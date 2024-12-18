import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

console.log("Переменная", process.env.DATABASE_URL);

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  await app.enableCors({
    origin: 'http://localhost:3000', // Разрешаем доступ из основного приложения
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  // Конфигурация Swagger для auth
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('The Auth service API documentation')
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document); // Swagger будет доступен по /api

  await app.listen(process.env.PORT ?? 4000);
  console.log(`Приложение Auth запущено, ${process.env.PORT} ?? 4000`)

}
bootstrap();
 