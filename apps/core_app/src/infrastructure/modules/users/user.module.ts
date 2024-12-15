import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { CreateUserUseCase } from 'apps/core_app/src/application/commands/users_cases/create-user.use-case';
import { UsersRepository } from './repositories/user.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUsersUseCase } from 'apps/core_app/src/application/commands/users_cases/get-users.use-case';
import { GetUserByUsernameUseCase } from 'apps/core_app/src/application/commands/users_cases/get-user-by-username.use-case';
import { AuthApiService } from 'auth-api/auth-api';
import { HttpModule } from '@nestjs/axios';
import { PrismaCoreAppService } from 'apps/core_app/prisma/prisma.service';


const useCasesUsers = [GetUsersUseCase, CreateUserUseCase, GetUserByUsernameUseCase]
@Module({
  imports: [CqrsModule,HttpModule],
  providers: [ PrismaCoreAppService, UsersRepository, ...useCasesUsers, AuthApiService],
  controllers: [UserController]
})
export class UserModule {}
