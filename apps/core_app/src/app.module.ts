import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { UserModule } from './infrastructure/modules/users/user.module';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { UserController } from './infrastructure/modules/users/controllers/user.controller';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './infrastructure/modules/global_module/global_module';

const ENV = process.env.NODE_ENV;
console.log(ENV);


@Module({
  imports: [PrismaModule, UserModule, GlobalModule,
    
    ConfigModule.forRoot({
    envFilePath: `.${ENV}.env`, // Определяем какой из ENV файлов подгрузиться, чтобы в зависимости от команды определялась БД (Production or Development)
  })
  ,],
  controllers: [AppController, UserController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
