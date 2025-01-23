import { Injectable } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class FilesClientService {
  @Client({
    transport: Transport.TCP,
    options: {
      host: process.env.FILES_SERVICE_HOST || '0.0.0.0',
      port: Number(process.env.FILES_SERVICE_PORT) || 3695,
    },
  })
  private client: ClientProxy;

  async validateAndUploadPhoto(photo: Buffer): Promise<{ url: string; description?: string }> {
    if (!photo) {
      throw new Error('Buffer is undefined');
    }
  
    // Создаем Readable поток из buffer
    const stream = Readable.from(photo);
  
    // Создаем объект, совместимый с Express.Multer.File
    const file: Express.Multer.File = {
      buffer: photo,  // Уже передаем буфер
      originalname: `photo-${crypto.randomUUID()}.jpeg`, // Уникальное имя файла
      mimetype: 'image/jpeg',  // Тип файла
      size: photo.length,  // Размер файла
      fieldname: 'file',  // Имя поля формы
      encoding: 'base64',  // Кодировка, если есть
      stream,  // Поток для работы с файлом
      destination: '',  // Можно оставить пустым для временного хранилища
      filename: `photo-${crypto.randomUUID()}.jpeg`,  // Генерация имени файла
      path: '',  // Пусть остается пустым, если не нужно сохранять в файловой системе
    };
  
    // Преобразуем Observable в Promise и загружаем файл
    const photoUrl = await this.sendFileToFilesService(file).toPromise();

    //console.log("photoUrl из SendFileService:", photoUrl)
  
    return { url: photoUrl };  // Возвращаем URL загруженного файла
  }
  

  sendFileToFilesService(file: Express.Multer.File): Observable<any> {
    return this.client.send({ cmd: 'upload_file' }, file);  // Отправляем файл
  }
}
