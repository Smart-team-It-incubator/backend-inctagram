import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class FilesController {
  @MessagePattern({ cmd: 'get_files' }) // Обработка команды 'get_files'
  getFiles(data: any) {
    console.log('Получен запрос:', data);
    return { message: 'Список файлов', data };
  }
}