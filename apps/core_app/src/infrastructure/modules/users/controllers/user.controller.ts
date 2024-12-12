import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUsersCommand } from 'apps/core_app/src/application/commands/users_cases/get-users.use-case';
import { CreateUserCommand } from 'apps/core_app/src/application/commands/users_cases/create-user.use-case';
import { ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'apps/core_app/src/application/dto/CreateUserDto';
import { UserViewModel } from 'apps/core_app/src/domain/interfaces/view_models/UserViewModel';



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
  async createUser(@Body() body: CreateUserDto): Promise<Partial<UserViewModel> | null> {
    const createUser: Partial<UserViewModel> | null = await this.commandBus.execute(new CreateUserCommand(body.email, body.password, body.username, body.firstName, body.lastName,));
    if (!createUser) {
      throw new HttpException('User not created', HttpStatus.BAD_REQUEST);
      
    }
    else if (createUser) {
      return createUser
    }
  } 
}