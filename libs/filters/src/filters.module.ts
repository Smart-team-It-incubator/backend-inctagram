import { Module } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { HttpExceptionFilter } from './http-exception.filter';

@Module({
  providers: [FiltersService, HttpExceptionFilter],
  exports: [FiltersService, HttpExceptionFilter],
})
export class FiltersModule {}
