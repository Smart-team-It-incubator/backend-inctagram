import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './infrastructure/modules/users/user.module';

import { UserController } from './infrastructure/modules/users/user.controller';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './infrastructure/modules/global_module/global_module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FilesGatewayController } from './infrastructure/modules/files_gateway/controllers/files.controller';
import { PrismaCoreAppService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailAdapterService } from '@app/email-service';
import { PostModule } from './infrastructure/modules/posts/post.module';
import { PostController } from './infrastructure/modules/posts/post.controller';

// const ENV = process.env.NODE_ENV;
// console.log(ENV);


@Module({
  imports: [ClientsModule.register([{
    name: 'FILES_SERVICE',
    transport: Transport.TCP,
    options: {
      host: process.env.FILES_SERVICE_HOST || '0.0.0.0',
      port: Number(process.env.FILES_SERVICE_PORT) || 3695,
    },
  }]),
    PrismaModule, UserModule, GlobalModule, PostModule,
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_FILE, // Загружаем файл из переменной окружения, если нужно
    })
  ,],
  controllers: [AppController, UserController, FilesGatewayController, PostController],
  providers: [AppService, PrismaCoreAppService],
})
export class AppModule {}
