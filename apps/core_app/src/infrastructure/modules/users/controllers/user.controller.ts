import { Controller, Get, Post, Body, HttpException, HttpStatus, Put, Param, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUsersCommand } from 'apps/core_app/src/application/commands/users_cases/get-users.use-case';
import { CreateUserCommand } from 'apps/core_app/src/application/commands/users_cases/create-user.use-case';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'apps/core_app/src/application/dto/CreateUserDto';
import { UserViewModel } from 'apps/core_app/src/domain/interfaces/view_models/UserViewModel';
import { GetUserByUsernameCommand } from 'apps/core_app/src/application/commands/users_cases/get-user-by-username.use-case';



@ApiTags('Users API') // Группировка в Swagger
@Controller('users')
export class UserController {
  constructor(private commandBus: CommandBus) {}


  @ApiOperation({ summary: 'Get all users' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User list successfully received' }) // Описание ответа
  @Get()
  async getUsers(): Promise<Partial<UserViewModel>[] | null> {
    const users: Partial<UserViewModel>[] | null = await this.commandBus.execute(new GetUsersCommand()); 
    if (!users) {
      throw new HttpException('Users not found', HttpStatus.BAD_REQUEST);
      
    }
    else if (users) {
      return users
    }
  }

  @ApiOperation({ summary: 'Create user' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User was created' }) // Описание ответа
  @ApiBody({
    description: 'Данные для создания пользователя',
    type: CreateUserDto,
  })
  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<Partial<UserViewModel> | null> {
    const createUser: Partial<UserViewModel> | null = await this.commandBus.execute(new CreateUserCommand(body.email, body.password, body.username, body.firstName, body.lastName, body.city, body.country, body.dateOfBirthday));
    if (!createUser) {
      throw new HttpException('User not created', HttpStatus.BAD_REQUEST);
      
    }
    else if (createUser) {
      return createUser
    }
  } 

  // Метод для обновления пользователя
  @ApiOperation({ summary: 'Update user' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User was successfully updated' }) // Описание ответа
  @ApiBody({
    description: 'Данные для обновления пользователя',
    type: CreateUserDto, // Это может быть другая DTO для обновления, которая может содержать только те поля, которые можно обновить.
  })
  @Put("/:userId") // Используем PUT для обновления
  async updateUser(@Param('userId') userId: string): Promise<string> {
    // Пока логика обновления не реализована, возвращаем описание того, что будет реализовано.
    return `Метод updateUser для пользователя с ID ${userId} еще не реализован, ожидается ТЗ`;
  }

  // Метод для удаления пользователя
  @ApiOperation({ summary: 'Delete user' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User was successfully deleted' }) // Описание ответа
  @ApiBody({
    description: 'Данные для удаления пользователя',
    type: CreateUserDto, // Можно использовать другой DTO, который содержит только идентификатор пользователя для удаления.
  })
  @Delete("/:userId") // Используем DELETE для удаления
  async deleteUser(@Param('userId') userId: string): Promise<string> {
    // Пока логика удаления не реализована, возвращаем описание того, что будет реализовано.
    return `Метод deleteUser для пользователя с ID ${userId} еще не реализован, ожидается ТЗ`;
  }


  //TODO - сделать метод закрытым, это внутренний метод который возвращает ЧУВСТВИТЕЛЬНЫЕ ДАННЫЕ
  // Метод для удаления пользователя
  @ApiOperation({ summary: 'Get User by username' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'respone with required user' }) // Описание ответа
  @Get("/:username") // Регистр username ВАЖЕН при поиске
  async findUserByUsername(@Param('username') username: string): Promise<string> {
    const user = await this.commandBus.execute(new GetUserByUsernameCommand(username));
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    return user
  }


}