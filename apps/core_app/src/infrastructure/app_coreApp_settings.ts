import { INestApplication, ValidationPipe } from "@nestjs/common";
import cookieParser from 'cookie-parser';
import { CustomValidationPipe } from "../domain/exceptions/Pipe/Custom_global_validation_pipe";
import { useContainer } from "class-validator";
import { AppModule } from "../app.module";
import { HttpExceptionFilter } from "@app/filters/http-exception.filter";

export async function app_coreApp_settings(app: INestApplication) {
  app.enableCors({
    origin: '"localhost:3001","localhost:3000",*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // Разрешение на использование куков
  })
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new CustomValidationPipe(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет поля, отсутствующие в DTO
      forbidNonWhitelisted: true, // Бросает ошибку, если поле отсутствует в DTO
      transform: true, // Автоматически преобразует входные данные в экземпляры классов DTO
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter())
  // Это нужно чтобы в проверки через class-validator можно было делать асинхронными
  // и была возможность внедрять классы в класс проверки
  // https://medium.com/yavar/custom-validation-with-database-in-nestjs-ac008f96abe2
  useContainer(app.select(AppModule), { fallbackOnErrors: true })
}