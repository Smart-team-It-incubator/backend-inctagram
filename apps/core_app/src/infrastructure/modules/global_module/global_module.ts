import { HttpModule, HttpService } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

@Global()
@Module({
    imports: [CqrsModule],
    providers: [],
    exports: [CqrsModule]
})

export class GlobalModule {}