import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { S3Service } from './files.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [],
  controllers: [FilesController],
  providers: [S3Service],
})
export class FilesModule {}
