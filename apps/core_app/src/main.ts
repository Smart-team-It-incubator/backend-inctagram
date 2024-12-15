import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomValidationPipe } from './domain/exceptions/Pipe/Custom_global_validation_pipe';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Глобальный префикс для всех эндпоинтов
  app.setGlobalPrefix('api/v1');

  // Подключение глобального пайпа для кастомизации и структурирования ошибок + проверки DTO которые приходят в контроллеры
  app.useGlobalPipes(
    new CustomValidationPipe(),
  );


  try {
    // Подключение Swagger для документации
    const config = new DocumentBuilder()
      .setTitle('Core_app API') // Укажи название API
      .setDescription('В API представлены методы для таких модулей как: Users, Posts, Auth, Files') // Добавь описание
      .setVersion('1.0') // Укажи версию
      .build();
    const coreDoc = SwaggerModule.createDocument(app, config);
    // Получение документации для auth микросервиса
    const authDoc = await axios.get('http://localhost:4000/api/v1-json'); // Путь к Swagger документации для auth, в настоящем пути "-json" нет, но это необходимо указать для того чтобы склеить документацию.
    //console.log(authDoc.data)
    const combinedDoc = {
      ...coreDoc,
      paths: {
        ...coreDoc.paths,
        ...authDoc.data.paths
      }
    };

    SwaggerModule.setup('api/v1/swagger', app, combinedDoc); // Укажи путь к документации
  } catch (error) {
    console.log("Документация не поднялась т.к сервер auth не запущен");
  }


  await app.listen(process.env.PORT ?? 3000);
  console.log(`Приложение запущено на порту ${process.env.PORT} ?? 3000`);
}
bootstrap();