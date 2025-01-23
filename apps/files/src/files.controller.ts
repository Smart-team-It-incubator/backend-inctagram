import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { S3Service } from './files.service';

@Controller()
export class FilesController {
  constructor(
    private readonly s3Service: S3Service
  ) { }
  @ApiExcludeEndpoint()
  @MessagePattern({ cmd: 'get_files' }) // Обработка команды 'get_files'
  getFiles(data: any) {

    //console.log('Получен запрос:', data);
    return { message: 'Список файлов', data };
  }


  @ApiExcludeEndpoint()
  @MessagePattern({ cmd: 'upload_file' })
  async uploadFile(@Payload() file: Express.Multer.File) { // @Payload декоратор
    //console.log('Получен файл:', file);
    return await this.s3Service.uploadFile(file); // Вызов метода uploadFile из S3Service
  }
  
}