import { Module } from '@nestjs/common';
import { UtilityAppController } from './utility_app.controller';
import { UtilityAppService } from './utility_app.service';

@Module({
  imports: [],
  controllers: [UtilityAppController],
  providers: [UtilityAppService],
})
export class UtilityAppModule {}
