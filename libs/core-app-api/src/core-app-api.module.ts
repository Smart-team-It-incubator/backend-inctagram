import { Module } from '@nestjs/common';
import { CoreAppApiService } from './core-app-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// const ENV = process.env.NODE_ENV;
// console.log(ENV);

@Module({
  imports: [HttpModule,],
  providers: [CoreAppApiService],
  exports: [CoreAppApiService],
})
export class CoreAppApiModule {}
