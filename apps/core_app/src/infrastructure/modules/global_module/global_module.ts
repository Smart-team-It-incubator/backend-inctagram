import { EmailAdapterService } from "@app/email-service";
import { TelegramService } from "@app/email-service/telegram-service";
import { HttpModule, HttpService } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

@Global()
@Module({
    imports: [CqrsModule],
    providers: [EmailAdapterService, TelegramService],
    exports: [CqrsModule, EmailAdapterService,]
})

export class GlobalModule {}