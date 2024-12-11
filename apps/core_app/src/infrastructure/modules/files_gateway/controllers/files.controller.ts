import { Controller, Get } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Files API') // Группировка в Swagger
@Controller('files')
export class FilesGatewayController {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { 
        host: process.env.FILES_SERVICE_HOST || '0.0.0.0', // 0.0.0.0 для локального прослушивания, а переменная для кубернетиса
        port: Number(process.env.FILES_SERVICE_PORT) || 3695, // В данном случае порт для локал и кубернетиса одинаковый
       }, // Параметры микросервиса Files
    });
  }

  @ApiOperation({ summary: 'Get files' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'Files received' }) // Описание ответа
  @Get()
  async getFiles() {
    return this.client.send({ cmd: 'get_files' }, { userId: 1 })
  }
}

