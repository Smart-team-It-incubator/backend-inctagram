import { Controller, Get } from '@nestjs/common';
import { UtilityAppService } from './utility_app.service';

@Controller()
export class UtilityAppController {
  constructor(private readonly utilityAppService: UtilityAppService) {}

  @Get()
  getHello(): string {
    return this.utilityAppService.getHello();
  }
}
