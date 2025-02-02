import { EmailAdapterService } from '@app/email-service';
import { TelegramService } from '@app/email-service/telegram-service';
import { RabbitClientLoggerService } from '@app/rabbit_client_logger';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { FilesClientService } from '../../config/files-client-proxy';

@Global()
@Module({
  imports: [
    CqrsModule,
    HttpModule, // Импортируем HttpModule, который автоматически настроит AXIOS_INSTANCE_TOKEN
  ],
  providers: [
    EmailAdapterService,
    TelegramService,
    RabbitClientLoggerService,
    JwtService,
    CoreAppApiService,
    FilesClientService,
  ],
  exports: [
    CqrsModule,
    EmailAdapterService,
    RabbitClientLoggerService,
    JwtService,
    CoreAppApiService,
    FilesClientService,
  ],
})
export class GlobalModule {}
