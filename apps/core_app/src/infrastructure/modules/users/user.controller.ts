import { Controller, Get, Post, Body, HttpException, HttpStatus, Put, Param, Delete, Query, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUsersCommand } from '@core_app/src/application/queries/users_query/get-users.use-case';
import { CreateUserCommand } from '@core_app/src/application/commands/users_cases/create-user.use-case';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserViewModel } from '@core_app/src/domain/interfaces/view_models/UserViewModel';
import { GetUserByUsernameCommand } from '@core_app/src/application/queries/users_query/get-user-by-username.use-case';
import { CreateUserDto } from '@app/shared-dto';
import { GetUserByGithubIdCommand } from '@core_app/src/application/queries/users_query/get-user-by-github.use-case';
import { DropDBCommand } from '@core_app/src/application/commands/users_cases/drop_user_db.use-case';
import { ConfirmEmailCommand } from '@core_app/src/application/commands/users_cases/confirm-email.use-case';
import { GetUserByEmailCommand } from '@core_app/src/application/queries/users_query/get-user-by-email.use-case';
import { UpdateUserDto } from '@app/shared-dto/dtos/user/update-user.dto';
import { UpdateUserCommand } from '@core_app/src/application/commands/users_cases/update-user.user-case';
import { ResendConfirmationCodeDto } from '@app/shared-dto/dtos/email/resend-email.dto';
import { ResendConfirmationCodeCommand } from '@core_app/src/application/commands/email_cases/email-confirmation-resend.use-case';
import { GetUserByResetPasswordTokenCommand } from '@core_app/src/application/queries/users_query/get-user-by-resetToken.use-case';
import { JwtAuthGuard } from '@app/guards';
import { PublicUserProfileDto } from '@app/shared-dto/dtos/user/public-profile-user.dto';
import { mapToPublicUserProfileDto } from '../../utils/user-mapper';
import { DeleteUserCommand } from '@core_app/src/application/commands/users_cases/delete-user.user-case';
import { RabbitClientLoggerService } from '@app/rabbit_client_logger';
import { UpdateAvatarCommand } from '@core_app/src/application/commands/users_cases/update_avatar.use-case';
import { FileInterceptor } from '@nestjs/platform-express';



@ApiTags('Users API') // Группировка в Swagger
@Controller('users')
export class UserController {
  constructor(private commandBus: CommandBus,
    private readonly logService: RabbitClientLoggerService
  ) { }


  @ApiOperation({ summary: 'Get all users' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User list successfully received' }) // Описание ответа
  @ApiResponse({
    description: "Тело ответа",
    type: [PublicUserProfileDto],
  })
  @Get()
  async getUsers(): Promise<PublicUserProfileDto[] | null> {

    // Тест логгера в микросервисе
    try {
      // Логика, которая может привести к ошибке
      throw new Error('Произошла ошибка!');
    } catch (error) {
      // Отправляем ошибку в логирующий микросервис
      this.logService.error({
        message: error.message,   // Передаем только строку с сообщением об ошибке
        timestamp: new Date().toISOString(),  // Время возникновения ошибки (по желанию)
        additionalInfo: {
          userId: 12345,  // Пример дополнительной информации
          requestId: 'abc123',  // Пример requestId
          errorStack: error.stack,  // Стек вызовов ошибки для более детального анализа
        }
      });
    }
    const users: Partial<UserViewModel>[] | null = await this.commandBus.execute(new GetUsersCommand());
    if (!users || users.length === 0) {
      throw new HttpException({ message: 'Users not found' }, HttpStatus.BAD_REQUEST);
    }
    // Обязательно мапим под нужный DTO, чтобы вернуть только необходимые поля + сгенерировать swagger
    return users.map(mapToPublicUserProfileDto);
  }

  @ApiOperation({ summary: 'Create user / registration' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User was created', type: PublicUserProfileDto }) // Описание ответа
  @ApiResponse({ status: 400, description: 'User not created' })
  @ApiBody({
    description: 'Данные для создания пользователя',
    type: CreateUserDto,
  })
  @Post("/registration")
  async registration(@Body() body: CreateUserDto): Promise<Partial<UserViewModel> | null> {
    const createUser: Partial<UserViewModel> | null = await this.commandBus.execute(new CreateUserCommand(body.email, body.password, body.username, body.firstName, body.lastName, body.city, body.country, body.dateOfBirthday));
    if (!createUser) {
      throw new HttpException({ message: 'User not created' }, HttpStatus.BAD_REQUEST);

    }
    else if (createUser) {
      return mapToPublicUserProfileDto(createUser)
    }
  }

  // Метод для обновления пользователя
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' }) // Описание эндпоинта
  // Описание ответов
  @ApiResponse({ status: 200, description: 'User was successfully updated' })
  @ApiResponse({ status: 400, description: 'User not updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    description: 'Данные для обновления пользователя',
    type: UpdateUserDto, // Это может быть другая DTO для обновления, которая может содержать только те поля, которые можно обновить.
  })
  @UseGuards(JwtAuthGuard)
  @Put("update/:userId") // Используем PUT для обновления
  async updateUser(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto): Promise<Partial<UserViewModel> | null> {
    try {
      const updateUser = await this.commandBus.execute(new UpdateUserCommand(userId, updateUserDto));
      return mapToPublicUserProfileDto(updateUser)
    } catch (error) {
      //console.log("ошибка при обновлении пользователя в контроллере", error.message);
      throw new HttpException({ message: 'User not updated, maybe user not found' }, HttpStatus.BAD_REQUEST);
    }

  }

  // Метод для удаления пользователя
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Delete user' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'User was successfully deleted' }) // Описание ответа
  @ApiBody({
    description: 'Данные для удаления пользователя',
    type: CreateUserDto, // Можно использовать другой DTO, который содержит только идентификатор пользователя для удаления.
  })
  @Delete("deluser/:userId") // Используем DELETE для удаления
  async deleteUser(@Param('userId') userId: string): Promise<string> {
    try {
      const deletedUser = await this.commandBus.execute(new DeleteUserCommand(userId));
      return deletedUser
    } catch (error) {
      //console.log("ошибка при удалении пользователя в контроллере", error.message);
      throw new HttpException({ message: 'User not deleted, maybe user not found' }, HttpStatus.BAD_REQUEST);
    }
  }


  // Это внутренний метод который возвращает ЧУВСТВИТЕЛЬНЫЕ ДАННЫЕ
  // Метод для получения пользователя по Username
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get User by username' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'respone with required user' }) // Описание ответа
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get("/getByUsername/:username") // Регистр username ВАЖЕН при поиске
  async findUserByUsername(@Param('username') username: string): Promise<string> {
    const user = await this.commandBus.execute(new GetUserByUsernameCommand(username));

    if (!user || !user.username) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    return user
  }

  // Это внутренний метод который возвращает ЧУВСТВИТЕЛЬНЫЕ ДАННЫЕ
  // Метод для получения пользователя по Email
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get User by email' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'response with required user' }) // Описание ответа
  @Get("/getByEmail/:email") // Регистр email ВАЖЕН при поиске
  async findUserByEmail(@Param('email') email: string): Promise<string> {
    const user = await this.commandBus.execute(new GetUserByEmailCommand(email));
    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.BAD_REQUEST);
    }
    return user
  }

  // Это внутренний метод который возвращает ЧУВСТВИТЕЛЬНЫЕ ДАННЫЕ
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get User by githubID' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'response with required user' }) // Описание ответа
  @Get("/getByGithubId/:githubId")
  async findUserByGithubId(@Param('githubId') githubId: string): Promise<string> {
    ////console.log("попадание в GetGitHubUser")
    const user = await this.commandBus.execute(new GetUserByGithubIdCommand(githubId));
    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.BAD_REQUEST);
    }
    return user
  }

  // Это внутренний метод который возвращает ЧУВСТВИТЕЛЬНЫЕ ДАННЫЕ
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get User by resetPasswordToken' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'response with required user' }) // Описание ответа
  @Get("/getByResetPasswordToken/:resetPasswordToken")
  async findUserByResetPasswordToken(@Param('resetPasswordToken') resetPasswordToken: string): Promise<string> {
    //console.log("попадание в resetPasswordToken Get User, resetPasswordToken:", resetPasswordToken)
    const user = await this.commandBus.execute(new GetUserByResetPasswordTokenCommand(resetPasswordToken));
    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.BAD_REQUEST);
    }
    return user
  }

  // Добавляем метод emailConfirmation
  @ApiOperation({ summary: 'Confirm user email' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'Email was successfully confirmed' }) // Описание ответа
  @ApiResponse({ status: 400, description: 'Invalid confirmation code or code expired (5 min)' }) // Описание ошибки
  @ApiBody({
    description: 'Код подтверждения для верификации email',
    schema: {
      type: 'object',
      properties: {
        confirmationCode: { type: 'string' },
      },
      required: ['confirmationCode'],
    },
  })
  @Post('/emailConfirmation')
  async emailConfirmation(@Query('code') confirmationCode: string): Promise<{ message: string }> {
    //console.log('confirmationCode:', confirmationCode);
    if (!confirmationCode) {
      throw new HttpException({ message: 'Confirmation code is required' }, HttpStatus.BAD_REQUEST);
    }

    const result = await this.commandBus.execute(new ConfirmEmailCommand(confirmationCode));

    if (result) {
      return { message: 'Email successfully confirmed' };
    } else {
      throw new HttpException({ message: 'Invalid confirmation code or code expired', field: "confirmationCode" }, HttpStatus.BAD_REQUEST);
    }
  }


  @ApiOperation({ summary: 'Resend confirmation code' }) // Описание эндпоинта
  @ApiResponse({
    status: 200,
    description: 'Confirmation code was successfully resent.',
    schema: { example: { message: 'Confirmation code was successfully resent' } },
  })
  @ApiResponse({
    status: 400,
    description: 'User not found or User already activated.',
    schema: { example: { statusCode: 400, message: 'User not found or User already activated', error: 'Bad Request' } },
  })
  @ApiBody({
    description: 'Email of the user requesting the confirmation code.',
    type: ResendConfirmationCodeDto,
  }) // Описание ожидаемого тела запроса
  @Post('/resendConfirmationCode')
  async resendConfirmationCode(@Body() resendConfirmationCodeDto: ResendConfirmationCodeDto): Promise<{ message: string }> {
    const { email } = resendConfirmationCodeDto;
    const result = await this.commandBus.execute(new ResendConfirmationCodeCommand(email));

    if (result) {
      return { message: 'Confirmation code was successfully resent' };
    } else {
      throw new HttpException({ message: 'User not found or User already activated' }, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put('/update-avatar')
  @ApiOperation({ summary: 'Обновление аватара пользователя' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения для загрузки',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Аватар успешно обновлён', type: PublicUserProfileDto })
  @ApiResponse({ status: 400, description: 'Файл обязателен' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ' })
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ): Promise<Partial<UserViewModel> | null> {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }
    const user = req.user;
    //console.log("user", user, user.id)
    const updateUser = await this.commandBus.execute(new UpdateAvatarCommand(user.id, file));
    //console.log(updateUser)
    return mapToPublicUserProfileDto(updateUser);
  }



  // For Dev
  @ApiExcludeEndpoint()
  @Delete('/drop-db')
  async dropDb() {
    return this.commandBus.execute(new DropDBCommand())
  }
  @ApiOperation({ summary: 'Проверка модуля Users на работоспособность' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'status: ok, app is available' })
  @Get('/health')
  async heath() {
    return { "status": "ok, app is available" }
  }

}