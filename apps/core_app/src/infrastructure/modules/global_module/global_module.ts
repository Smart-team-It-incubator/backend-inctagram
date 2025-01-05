import { EmailAdapterService } from "@app/email-service";
import { HttpModule, HttpService } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

@Global()
@Module({
    imports: [CqrsModule],
    providers: [EmailAdapterService],
    exports: [CqrsModule, EmailAdapterService]
})

export class GlobalModule {}