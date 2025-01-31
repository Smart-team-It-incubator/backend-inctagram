import * as newrelic from 'newrelic';
import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import newrelicFormatter from "@newrelic/winston-enricher"
import winston from 'winston';

//const newrelicFormatter = require('@newrelic/winston-enricher')
//const winston = require('winston')
const newrelicWinstonFormatter = newrelicFormatter(winston)

@Injectable()
export class LogService {
  private logger = createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.label({label: 'test'}),
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

  log(data: any) {
    console.log("Попали в сервис для отправки в new relic")
    this.logger.info(data);
    newrelic.addCustomAttributes({ error: data });
    newrelic.noticeError(new Error(data.message || 'Info event'));
  }

  error(data: any) {
    console.log("Попали в метод ошибки для отправки в new relic")
    this.logger.error(data);
    newrelic.addCustomAttributes({ error: data });
    newrelic.noticeError(new Error(data.message || 'Error event'));
  }
}
