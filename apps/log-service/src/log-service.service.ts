import * as newrelic from 'newrelic';
import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import newrelicFormatter from "@newrelic/winston-enricher"
import winston from 'winston';

const newrelicWinstonFormatter = newrelicFormatter(winston)

@Injectable()
export class LogService {
  private logger = createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.label({ label: 'Log Service' }),
      newrelicWinstonFormatter()
    ),
    transports: [
      new transports.Console(), // Вывод в консоль
      new transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
      }),
    ],
  });

  info(data: any) {

    // Локально логируем в папку Logs и в консоль, на случай если new relic недоступен
    this.logger.info(data.message || 'Info event', {
      additionalInfo: data.additionalInfo, // Дополнительная информация, если есть
    });

    // Отправляем данные в New Relic, используя customAttributes
    newrelic.noticeError(new Error(data.message || 'Info event'));
    newrelic.addCustomAttributes({ customAttributes: data.additionalInfo });
  }

  warn(data: any) {
    // Локально логируем в папку Logs и в консоль, на случай если new relic недоступен
    this.logger.warn(data.message || 'Warning event', {
      additionalInfo: data.additionalInfo, // Дополнительная информация
    });

    // Отправляем данные в New Relic, используя customAttributes
    newrelic.noticeError(new Error(data.message || 'Warning event'));
    newrelic.addCustomAttributes({ customAttributes: data.additionalInfo });
  }

  debug(data: any) {
    // Локально логируем в папку Logs и в консоль, на случай если new relic недоступен
    this.logger.debug(data.message || 'Debug event', {
      additionalInfo: data.additionalInfo, // Дополнительная информация
    });

    // Отправляем данные в New Relic, используя customAttributes
    newrelic.noticeError(new Error(data.message || 'Debug event'));
    newrelic.addCustomAttributes({ customAttributes: data.additionalInfo });
  }

  error(data: any) {
    // Локально логируем в папку Logs и в консоль, на случай если new relic недоступен
    this.logger.error(data.message || 'Error event', {
      additionalInfo: data.additionalInfo, // Дополнительная информация
    });

    // Отправляем данные в New Relic, используя customAttributes
    newrelic.noticeError(new Error(data.message))
    newrelic.addCustomAttributes({ customAttributes: data.additionalInfo });
  }
}
