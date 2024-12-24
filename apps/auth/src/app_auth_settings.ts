import { CustomValidationPipe } from "@core_app/src/domain/exceptions/Pipe/Custom_global_validation_pipe";
import { INestApplication } from "@nestjs/common";
import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";
import { AuthModule } from "./auth.module";


export async function app_auth_settings(app: INestApplication) {
    app.enableCors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
    })
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
      app.useGlobalPipes(
        new CustomValidationPipe(),
      );
    // Это нужно чтобы в проверки через class-validator можно было делать асинхронными
    // и была возможность внедрять классы в класс проверки
    // https://medium.com/yavar/custom-validation-with-database-in-nestjs-ac008f96abe2
    useContainer(app.select(AuthModule), { fallbackOnErrors: true })
    await app.listen(process.env.PORT_AUTH ?? 4000);
    console.log(`Приложение запущено на порту ${process.env.PORT} ?? 4000`);
}