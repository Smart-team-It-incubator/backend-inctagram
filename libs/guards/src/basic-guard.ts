import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class BasicAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const headerAuth = req.headers.authorization;

    //console.log("Попал в Basic Guard, проверяем авторизацию");

    // Логин и пароль для проверки
    const validUsername = 'admin';
    const validPassword = 'qwerty';

    // Проверяем наличие заголовка Authorization
    if (!headerAuth || !headerAuth.startsWith('Basic ')) {
      throw new HttpException({message: 'Missing Authorization Header'}, HttpStatus.UNAUTHORIZED);
    }

    // Извлекаем закодированные данные
    const base64Credentials = headerAuth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8'); // Декодируем Base64
    const [username, password] = credentials.split(':'); // Разделяем на логин и пароль

    // Сравниваем с валидными данными
    if (username !== validUsername || password !== validPassword) {
      throw new HttpException({message: 'Incorrect username or password'}, HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
