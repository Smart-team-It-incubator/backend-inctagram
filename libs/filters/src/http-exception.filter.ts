import { RabbitClientLoggerService } from '@app/rabbit_client_logger';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logService: RabbitClientLoggerService
  ) { }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal Server Error" };

    // Логируем только ошибки 500 (неожиданные ошибки)
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      const errorMessage =
        exception instanceof Error ? exception.message : 'Unknown error';

      // Логируем ошибку в RabbitMQ через RabbitClientLoggerService
      this.logService.error({
        message: errorMessage,
        additionalInfo: {
          requestId: request.headers['x-request-id'], // можешь добавить свой ID запроса
          userId: request.user?.id, // если есть информация о пользователе
          errorStack: exception.stack,
        },
      });
    }

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
