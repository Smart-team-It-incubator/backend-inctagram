import { INestApplication, ValidationPipe } from "@nestjs/common";
import cookieParser from 'cookie-parser';
import { CustomValidationPipe } from "../domain/exceptions/Pipe/Custom_global_validation_pipe";
import { useContainer } from "class-validator";
import { AppModule } from "../app.module";

export async function app_coreApp_settings(app: INestApplication) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://smart-reg.org.ru',
    'https://auth.smart-reg.org.ru',
  ];
app.enableCors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    methods: 'GET,POST,PUT,DELETE',
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
  //app.useGlobalFilters(new HttpExceptionFilter())
  // Это нужно чтобы в проверки через class-validator можно было делать асинхронными
  // и была возможность внедрять классы в класс проверки
  // https://medium.com/yavar/custom-validation-with-database-in-nestjs-ac008f96abe2
  useContainer(app.select(AppModule), { fallbackOnErrors: true })
}