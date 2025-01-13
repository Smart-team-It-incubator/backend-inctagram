import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import axios from 'axios';
import { app_coreApp_settings } from './infrastructure/app_coreApp_settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app_coreApp_settings(app)

  try {
    // Подключение Swagger для документации
    const config = new DocumentBuilder()
      .setTitle('Core_app API') // Укажи название API
      .setDescription('В API представлены методы для таких модулей как: Users, Posts, Auth, Files. К методам Auth и Github раздела ОБЯЗАТЕЛЬНО добавлять субдомен auth. (например https://auth.smart-reg.org.ru/api/v1/auth/github/)') // Добавь описание
      .setVersion('1.0') // Укажи версию
      .build();
    const coreDoc = SwaggerModule.createDocument(app, config);
    // Получение документации для auth микросервиса
    const authDoc = await axios.get(`${process.env.AUTH_APP_URL}-json`); // Путь к Swagger документации для auth, в настоящем пути "-json" нет, но это необходимо указать для того чтобы склеить документацию.
    //const authDoc = await axios.get(`http://localhost:4000/api/v1-json`); // Путь к Swagger документации для auth, в настоящем пути "-json" нет, но это необходимо указать для того чтобы склеить документацию.
    //console.log(authDoc.data)
    const combinedDoc = {
      ...coreDoc,
      // Подтягивает пути документации
      paths: {
        ...coreDoc.paths,
        ...authDoc.data.paths
      },
      // Подтягивает схемы документации
      components: {
        schemas: {
          ...coreDoc.components?.schemas,
          ...authDoc.data.components?.schemas,
        },
        securitySchemes: {
          ...coreDoc.components?.securitySchemes,
          ...authDoc.data.components?.securitySchemes,
        },
      },
    };
    //console.log(...authDoc.data.paths)
    SwaggerModule.setup('api/v1/swagger', app, combinedDoc); // Укажи путь к документации
  } catch (error) {
    console.log(error)
    console.log("Документация не поднялась т.к сервер auth не запущен");
  }

  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Приложение запущено на порту ${process.env.PORT} ?? 3000`);
}
bootstrap();