import { EmailAdapterService } from "@app/email-service";
import { TelegramService } from "@app/email-service/telegram-service";
import { RabbitClientLoggerService } from "@app/rabbit_client_logger";
import { HttpModule, HttpService } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

@Global()
@Module({
    imports: [CqrsModule, ],
    providers: [EmailAdapterService, TelegramService, RabbitClientLoggerService],
    exports: [CqrsModule, EmailAdapterService, RabbitClientLoggerService]
})

export class GlobalModule {}