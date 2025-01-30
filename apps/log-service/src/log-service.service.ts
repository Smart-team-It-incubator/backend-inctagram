import * as newrelic from 'newrelic';
import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';


@Injectable()
export class LogService {
  private logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.json(),
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
    
    this.logger.info(data);
  }

  error(data: any) {
    this.logger.error(data);
  }
}