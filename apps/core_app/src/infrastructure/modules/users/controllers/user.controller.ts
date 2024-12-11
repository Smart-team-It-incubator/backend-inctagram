import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUsersCommand } from 'apps/core_app/src/application/commands/users_cases/get-users.use-case';
import { CreateUserCommand } from 'apps/core_app/src/application/commands/users_cases/create-user.use-case';
import { ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';



// DTO для Swagger
class CreateUserDto {
  // Обязательно описываем класс нижеуказанной рефлексией, в противном случае информация не подтянется в Swagger
  @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Имя пользователя', example: 'John Doe' })
  name: string;
}

@ApiTags('Users API') // Группировка в Swagger
@Controller('users')
export class UserController {
  constructor(private commandBus: CommandBus) {}


  @ApiOperation({ summary: 'Get all users' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User list successfully received' }) // Описание ответа
  @Get()
  async getUsers() {
    return this.commandBus.execute(new GetUsersCommand()); }

  @ApiOperation({ summary: 'Create user' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User was created' }) // Описание ответа
  @ApiBody({
    description: 'Данные для создания пользователя',
    type: CreateUserDto,
  })
  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(body.email, body.name));
  } 
}