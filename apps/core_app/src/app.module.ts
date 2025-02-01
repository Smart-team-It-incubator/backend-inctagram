import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './infrastructure/modules/global_module/global_module';

@Module({
  imports: [    
    GlobalModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_FILE, // Загружаем файл из переменной окружения, если нужно
    })],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
