import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LogService } from './log-service.service';

@Controller()
export class LogController {
  constructor(private readonly logService: LogService) {}

  @EventPattern('log_event')
  handleLog(@Payload() data: any) {
    console.log('Получен лог:', data);
    if (data.level === 'error') {
      this.logService.error(data);
    } else {
      this.logService.log(data);
    }
  }
}