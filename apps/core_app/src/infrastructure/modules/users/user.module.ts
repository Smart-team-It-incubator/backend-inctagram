import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '@core_app/src/application/commands/users_cases/create-user.use-case';
import { UsersRepository } from './user.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUsersUseCase } from '@core_app/src/application/commands/users_cases/get-users.use-case';
import { GetUserByUsernameUseCase } from '@core_app/src/application/commands/users_cases/get-user-by-username.use-case';
import { AuthApiService } from 'auth-api/auth-api';
import { HttpModule } from '@nestjs/axios';
import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { DropDBUseCase } from '@core_app/src/application/commands/users_cases/drop_user_db.use-case';
import { ConfirmEmailUseCase } from '@core_app/src/application/commands/users_cases/confirm-email.use-case';
import { GetUserByEmailUseCase } from '@core_app/src/application/commands/users_cases/get-user-by-email.use-case';
import { GetUserByGithubIdUseCase } from '@core_app/src/application/commands/users_cases/get-user-by-github.use-case';
import { UpdateUserUseCase } from '@core_app/src/application/commands/users_cases/update-user.user-case';
import { ResendConfirmationCodeUseCase } from '@core_app/src/application/commands/email_cases/email-confirmation-resend.use-case';
import { GetUserByResetPasswordTokenUseCase } from '@core_app/src/application/commands/users_cases/get-user-by-resetToken.use-case';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { JwtService } from '@nestjs/jwt';


const useCasesUsers = [GetUserByResetPasswordTokenUseCase,
  GetUsersUseCase, CreateUserUseCase, GetUserByUsernameUseCase, GetUserByEmailUseCase, DropDBUseCase, ConfirmEmailUseCase, GetUserByGithubIdUseCase, UpdateUserUseCase, ResendConfirmationCodeUseCase]
@Module({
  imports: [CqrsModule,HttpModule,],
  providers: [ PrismaCoreAppService, UsersRepository, ...useCasesUsers, AuthApiService, JwtService, CoreAppApiService],
  controllers: [UserController]
})
export class UserModule {}
