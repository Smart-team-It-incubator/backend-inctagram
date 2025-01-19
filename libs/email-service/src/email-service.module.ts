import { Module } from '@nestjs/common';
import { EmailAdapterService } from '.';

@Module({
  providers: [EmailAdapterService,],
  exports: [EmailAdapterService],
})
export class EmailServiceModule {}
