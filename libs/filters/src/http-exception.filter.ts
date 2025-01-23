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

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody =
      exception instanceof HttpException ? exception.getResponse() : null;

    // Проверяем, является ли это ошибка от class-validator, если да, то возвращаем без изменений
    if (
      exception instanceof HttpException &&
      typeof responseBody === 'object' &&
      responseBody !== null &&
      responseBody['message'] === 'Validation failed' &&
      Array.isArray(responseBody['errors']) // Ошибки class-validator содержат массив "errors"
    ) {
      return response.status(status).json(responseBody); // Возвращаем без изменений
    }

    // Формируем сообщение об ошибке для остальных исключений
    let message: string;
    let field: string | null = null;

    if (typeof responseBody === 'string') {
      message = responseBody;
    } else if (typeof responseBody === 'object' && responseBody !== null) {
      message = responseBody['message'] || 'Internal server error';
      field = responseBody['field'] || null;
    } else {
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
