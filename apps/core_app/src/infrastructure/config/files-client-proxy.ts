import { Injectable } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class FilesClientService {
  @Client({
    transport: Transport.TCP,
    options: {
      host: process.env.FILES_SERVICE_HOST || '0.0.0.0', // Укажите хост для Files микросервиса
      port: Number(process.env.FILES_SERVICE_PORT) || 3695,
    },
  })
  private client: ClientProxy;

  // Метод для отправки файла в Files микросервис
  sendFileToFilesService(file: Express.Multer.File): Observable<any> {
    return this.client.send({ cmd: 'upload_file' }, file); // отправляем файл
  }
}