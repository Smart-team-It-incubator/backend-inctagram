import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  getHello(): string {
    return 'Welcome to FilesApp!';
  }
}
