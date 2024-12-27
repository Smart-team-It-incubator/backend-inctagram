import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Inctagram basic API') // Группировка в Swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'First pages' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'Welcome to Inctagram' }) // Описание ответа
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
