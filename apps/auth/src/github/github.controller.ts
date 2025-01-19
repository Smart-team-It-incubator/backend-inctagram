import { CreateUserDto } from '@app/shared-dto';
import { UpdateUserDto } from '@app/shared-dto/dtos/user/update-user.dto';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthApiService } from "auth-api/auth-api";
import { generateUsernameFromEmail, getUniqueUsername } from './github_utils';

@ApiTags('Github')
@Controller('auth/github')
export class GithubAuthController {
  constructor(
    private readonly CoreAppApiService: CoreAppApiService,
    private readonly AuthApiService: AuthApiService,
  ) { }



  @Get()
  @ApiOperation({ summary: 'Login через Github' })
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    console.log("Попадание в Github Login")
    // Redirect to GitHub login page
  }


  @ApiExcludeEndpoint()
  @Get('callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Github callback' })
  async githubCallback(@Req() req, @Res() res) {
    const githubUser = req.user; // Данные пользователя из GitHub
    const { githubId, email, username } = githubUser;
    const isGithubRequest = true
    //console.log("Попали в GitHub callback", githubUser);

    // Генерация username, если он не пришел от GitHub
    let validUsername = username || generateUsernameFromEmail(email);
    // Проверка уникальности username
    validUsername = await getUniqueUsername(validUsername, this.CoreAppApiService);
    console.log("validUsername при регистрации через Github:", validUsername);

    // 1. Ищем пользователя по githubId
    let userByGithubId = await this.CoreAppApiService.getUserByGithubId(githubId);
    //console.log("userByGithubId", userByGithubId);

    // 2. Ищем пользователя по Email
    let userByEmail = await this.CoreAppApiService.getUserByEmail(email);
    //console.log("userByEmail", userByEmail);

    // 3. Пользователь найден по githubId, выполняем вход
    if (userByGithubId) {
      const loginResult = await this.AuthApiService.login({ email, password: 'emptyPassword', githubId, isGithubRequest },);

      // Отправляем accessToken и refreshToken в cookies
      res.cookie('accessToken', loginResult.accessToken, {
        httpOnly: process.env.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 день
      });
      res.cookie('refreshToken', loginResult.refreshToken, {
        httpOnly: process.env.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 день
      });

      // Редирект на нужную страницу
      //return res.redirect('http://localhost:3000/'); // Редирект на страницу после отправки токенов
      return res.redirect('http://smart-reg.org.ru/'); // Редирект на страницу после отправки токенов
    }

    // 4. Если пользователь есть, но GitHub не привязан, привязываем
    if (userByEmail && !userByEmail.githubProviders) {
      const userUpdateDto: UpdateUserDto = { githubId: githubId };
      await this.CoreAppApiService.updateUser(userByEmail.id, userUpdateDto);
      const loginResult = await this.AuthApiService.login({ email, password: 'emptyPassword', githubId, isGithubRequest },);
      // Отправляем accessToken и refreshToken в cookies
      res.cookie('accessToken', loginResult.accessToken, {
        httpOnly: process.env.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 день
      });
      res.cookie('refreshToken', loginResult.refreshToken, {
        httpOnly: process.env.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 день
      });

      // Редирект на нужную страницу
      //return res.redirect('http://localhost:3000/'); // Редирект на страницу после отправки токенов
      return res.redirect('http://smart-reg.org.ru/'); // Редирект на страницу после отправки токенов
    }

    // 5. Если пользователь не найден, регистрируем нового
    if (!userByGithubId && !userByEmail) {
      const createUserDto: CreateUserDto = {
        email,
        username: validUsername,
        githubId: githubId,
        password: 'githubEmptyPassword', // Генерация временного пароля
      };

      // Регистрируем пользователя
      const newUser = await this.CoreAppApiService.registerUserByGithub(createUserDto);

      // console.log("new user",newUser)

      // Верифицируем Email т.к он подтвержден Github
      const userUpdateDto: UpdateUserDto = { isEmailConfirmed: true };
      await this.CoreAppApiService.updateUser(newUser.id, userUpdateDto);

      // После регистрации, выполняем вход
      const loginResult = await this.AuthApiService.login({ email, password: 'githubEmptyPassword', githubId, isGithubRequest },);

      // Отправляем accessToken и refreshToken в cookies
      res.cookie('accessToken', loginResult.accessToken, {
        httpOnly: process.env.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 день
      });
      res.cookie('refreshToken', loginResult.refreshToken, {
        httpOnly: process.env.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 день
      });

      // Редирект на нужную страницу после регистрации
      //return res.redirect('http://localhost:3000/'); // Редирект на страницу после отправки токенов
      return res.redirect('http://smart-reg.org.ru/'); // Редирект на страницу после отправки токенов
    }

    // На случай, если все варианты не сработают
    return res.status(400).json({ message: 'Unexpected error during GitHub authentication.' });
  }

}
