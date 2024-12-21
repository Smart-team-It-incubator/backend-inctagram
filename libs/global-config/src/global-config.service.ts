import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalConfigService {
    constructor(private configService: ConfigService) {}


    get() {
        return {
            mode: this.configService.get<string>('MODE') || '',
			postgresDb: {
				host: this.configService.get<string>('POSTGRES_DB_URL') || '',
			},
			mongoDb: {
				host: this.configService.get<string>('MONGO_DB_URL') || '',
			},
			mainMicroService: {
				port: parseInt(this.configService.get<string>('MAIN_MICROSERVICE_PORT') || '0', 10),
			},
			filesMicroService: {
				port: parseInt(
					this.configService.get<string>('FILES_MICROSERVICE_PORT') || '0',
					10,
				),
			},
			refreshToken: {
				name: 'refreshToken',
				lifeDurationInMs: 1000 * 60 * 60 * 24 * 30, // 30 days
			},
			accessToken: {
				name: 'accessToken',
				lifeDurationInMs: 1000 * 60 * 30, // 30 minutes
			},
			jwt: {
				secret: 'secret',
			},
        }
    }
}
