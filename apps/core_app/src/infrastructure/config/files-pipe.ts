import { PipeTransform, HttpException, HttpStatus } from "@nestjs/common";

export class FileSizeValidationPipe implements PipeTransform {
  constructor(private readonly maxSize: number) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new HttpException({message: 'File is required' }, HttpStatus.BAD_REQUEST);
    }

    if (file.size > this.maxSize) {
      throw new HttpException( {message: `File size exceeds the maximum allowed size of ${this.maxSize} bytes`}
        ,
        HttpStatus.BAD_REQUEST,
      );
    }

    return file;
  }
}
