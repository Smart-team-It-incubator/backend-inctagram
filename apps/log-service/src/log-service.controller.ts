import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LogService } from './log-service.service';

@Controller()
export class LogController {
  constructor(private readonly logService: LogService) {}

  @EventPattern('log_event')
  handleLog(@Payload() data: any) {
    console.log("Rabbit consumer получил данные одает в log-service");
    
    // В зависимости от уровня логирования вызываем разные методы логирования
    switch (data.level) {
      case 'error':
        this.logService.error(data);
        break;
      case 'warn':
        this.logService.warn(data);
        break;
      case 'debug':
        this.logService.debug(data);
        break;
      case 'info':
      default:
        this.logService.info(data);
        break;
    }
  }
}
