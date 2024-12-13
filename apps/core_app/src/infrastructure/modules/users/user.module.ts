import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserUseCase } from 'apps/core_app/src/application/commands/users_cases/create-user.use-case';
import { UsersRepository } from './repositories/user.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUsersUseCase } from 'apps/core_app/src/application/commands/users_cases/get-users.use-case';
import { GetUserByUsernameUseCase } from 'apps/core_app/src/application/commands/users_cases/get-user-by-username.use-case';


const useCasesUsers = [GetUsersUseCase, CreateUserUseCase, GetUserByUsernameUseCase]
@Module({
  imports: [CqrsModule],
  providers: [ PrismaService, UsersRepository, ...useCasesUsers],
  controllers: [UserController]
})
export class UserModule {}
