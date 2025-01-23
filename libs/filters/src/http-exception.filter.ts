import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    //console.log("Попадание в HttpExceptionFilter", exception);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody =
      exception instanceof HttpException ? exception.getResponse() : null;
    // console.log(responseBody)
    // Формируем сообщение об ошибке
    // Проверяем тип responseBody и извлекаем значения
    let message: string;
    let field: string | null = null;

    if (typeof responseBody === 'string') {
      // Если responseBody - строка, используем ее как сообщение
      message = responseBody;
    } else if (typeof responseBody === 'object' && responseBody !== null) {
      // Если это объект, берем поле message и field
      message = responseBody['message'] || 'Internal server error';
      field = responseBody['field'] || null;
    } else {
      // На случай, если ничего не подошло
      message = 'Internal server error';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(field && { field }), // Добавляем поле, если оно есть
    };

    response.status(status).json(errorResponse);
  }
}
