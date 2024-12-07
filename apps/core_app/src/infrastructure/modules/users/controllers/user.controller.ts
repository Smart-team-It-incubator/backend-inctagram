import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUsersCommand } from 'apps/core_app/src/application/commands/users_cases/get-users.use-case';
import { CreateUserCommand } from 'apps/core_app/src/application/commands/users_cases/create-user.use-case';

@Controller('users')
export class UserController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  async getUsers() {
    return this.commandBus.execute(new GetUsersCommand()); }

  @Post()
  async createUser(@Body() body: { email: string; name: string }) {
    return this.commandBus.execute(new CreateUserCommand(body.email, body.name));
  }
}