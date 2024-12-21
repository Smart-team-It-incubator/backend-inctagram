import { Module } from '@nestjs/common';
import { GlobalConfigService } from './global-config.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			ignoreEnvFile:
				process.env.NODE_ENV !== 'DEVELOPMENT' && process.env.NODE_ENV !== 'TEST',
			envFilePath: ['.env', '.env.test'],
		}),
	],
  providers: [GlobalConfigService],
  exports: [GlobalConfigService],
})
export class GlobalConfigModule {}
