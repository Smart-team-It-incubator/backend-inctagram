import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './infrastructure/modules/global_module/global_module';
import { HttpExceptionFilter } from '@app/filters/http-exception.filter';
import { RabbitClientLoggerService } from '@app/rabbit_client_logger';
import { APP_FILTER } from '@nestjs/core';
import { UserController } from './infrastructure/modules/users/user.controller';
import { PostController } from './infrastructure/modules/posts/post.controller';
import { UserModule } from './infrastructure/modules/users/user.module';
import { PostModule } from './infrastructure/modules/posts/post.module';

@Module({
  imports: [    
    GlobalModule, UserModule, PostModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_FILE, // Загружаем файл из переменной окружения, если нужно
    })],
  controllers: [AppController, UserController, PostController],
  providers: [AppService,
    RabbitClientLoggerService,  // Регистрация сервиса для инжекции в фильтр
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,  // Использование фильтра в качестве глобального
    },
  ],
  exports: [RabbitClientLoggerService]
})
export class AppModule {}
