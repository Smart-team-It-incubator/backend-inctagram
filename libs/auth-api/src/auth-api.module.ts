import { Module } from '@nestjs/common';
import { AuthApiService } from './auth-api.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AuthApiService],
  exports: [AuthApiService,],
})
export class AuthApiModule {}
