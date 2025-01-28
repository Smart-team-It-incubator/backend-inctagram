import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './infrastructure/modules/users/user.module';
import { UserController } from './infrastructure/modules/users/user.controller';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './infrastructure/modules/global_module/global_module';
import { FilesGatewayController } from './infrastructure/modules/files_gateway/controllers/files.controller';
import { PrismaCoreAppService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailAdapterService } from '@app/email-service';
import { PostModule } from './infrastructure/modules/posts/post.module';
import { PostController } from './infrastructure/modules/posts/post.controller';
import { JwtService } from '@nestjs/jwt';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { HttpModule } from '@nestjs/axios';
import { FilesClientService } from './infrastructure/config/files-client-proxy';
import { RabbitMQModule } from '@app/email-service/rabbitMQ/rabbit.module';
import { EmailConsumerService } from '@app/email-service/rabbitMQ/email-consumer-service';
import { EmailProducerService } from '@app/email-service/rabbitMQ/email-producer-service';


@Module({
  imports: [    
    PrismaModule, UserModule, GlobalModule, PostModule, HttpModule, RabbitMQModule, 
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_FILE, // Загружаем файл из переменной окружения, если нужно
    })
  ,],
  controllers: [AppController, UserController, FilesGatewayController, PostController],
  providers: [AppService, PrismaCoreAppService, JwtService, CoreAppApiService, FilesClientService, EmailProducerService, EmailConsumerService,],
})
export class AppModule {}
