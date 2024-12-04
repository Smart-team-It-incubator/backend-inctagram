import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilityAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
