import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { getFieldInErrorObject, getRequest, postRequest } from './utils/common';
import { RouteNames } from '../src/routesConfig/routeNames';
import { clearAuthDB, clearCoreDB } from './utils/clearDB';
import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { UserModule } from '@core_app/src/infrastructure/modules/users/user.module';
import { AppModule } from '@core_app/src/app.module';
import { app_auth_settings } from '@auth/src/app_auth_settings';
import { app_coreApp_settings } from '@core_app/src/infrastructure/app_coreApp_settings';
import { isEmail } from 'class-validator';

describe('E2E registration SINGLE user/auth flow', () => {
  jest.setTimeout(20000);
  let appAuth: INestApplication;
  let appCoreApp: INestApplication;
  let prismaServiceAuth: PrismaService;
  let prismaServiceCoreApp: PrismaCoreAppService;

  const userForTest = {
    email: "testUser11@gmail.com",
    username: "UserWithHash2",
    password: "Testpassword1!",
    firstName: "Bobby",
    lastName: "Kubob",
    country: "USA",
    city: "New York",
    dateOfBirthday: "2001-01-01"
  }

  const incorrectDtoForRegistation = {
    email: "wrong-email", // Не Email
    username: "User", // Заведомо короткое имя
    password: "bad", // Короткий пароль
    firstName: "Bobby",
    lastName: "Kubob",
    country: "USA",
    city: "New York",
    dateOfBirthday: "2001-01-01"
  }

  let globalAccessToken = ''
  let globalRefreshToken = ''

  beforeAll(async () => {
    const authModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule], // Здесь это единственный (основной) модуль
    }).compile();

    const coreAppModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UserModule], // Обязательно импортируем главный модуль, который импортирует все остальные
    }).compile();

    // Запуск приложений
    appAuth = authModuleFixture.createNestApplication();
    appCoreApp = coreAppModuleFixture.createNestApplication();

    // Применяем настройки к приложениям (Порт, Префиксы, Пайпы) из функции
    await app_auth_settings(appAuth);
    await app_coreApp_settings(appCoreApp);
    await appAuth.listen(4000);
    await appCoreApp.listen(3000);

    // Создаем экземпляры сервисов нашей Prisma, чтобы их можно было использовать в тестах напрямую
    prismaServiceAuth = appAuth.get<PrismaService>(PrismaService);
    prismaServiceCoreApp = appCoreApp.get<PrismaCoreAppService>(PrismaCoreAppService);

    // Чистим тестовые БД перед запуском
    await clearAuthDB(appAuth)
    await clearCoreDB(appCoreApp)
  });

  // it('should connect to the database AUTH successfully', async () => {
  //   try {
  //     await prismaServiceAuth.$connect();
  //     console.log('Database connected successfully!');
  //   } catch (error) {
  //     console.error('Database connection failed:', error);
  //     throw error;
  //   }
  // });
  // it('should connect to the database CORE_APP successfully', async () => {
  //   try {
  //     await prismaServiceCoreApp.$connect();
  //     console.log('Database connected successfully!');
  //   } catch (error) {
  //     console.error('Database connection failed:', error);
  //     throw error;
  //   }
  // });

  // beforeEach(async () => {
  // 	await clearAuthDB(appAuth)
  //   await clearCoreDB(appCoreApp)
  // })

  afterAll(async () => {
    await prismaServiceAuth.$disconnect();
    await prismaServiceCoreApp.$disconnect();
    await appAuth.close();
    await appCoreApp.close();
  });

  // Методы ничего не возвращают кроме 200, просто проверяем что приложения подняты и доступны
  describe("Проверяем доступность основных приложений", () => {
    jest.setTimeout(20000);

    it('should return 200 from the Auth application', async () => {
      await getRequest(appAuth, "api/v1/auth/health")
        .expect(200);
    });

    it('should return 200 from the Core_app application', async () => {

      await getRequest(appCoreApp, "api/v1/users/health")
        .expect(200);
    });
  })

  // it('проверяем наличие hash-password', async () => {
  //   console.log("AppCore путь", appAuth.getHttpServer().address());
  //   const axios = require('axios');
  //   const response1 = await axios.post('http://127.0.0.1:4000/api/v1/auth/hash-password', {
  //     password: 'Testpassword1!',
  //   });
  //   console.log(response1.data);
  //   const response = await postRequest(appAuth, "api/v1/auth/hash-password")
  //     .send({ password: 'Testpassword1!' })
  //     .expect(201);
  // })

  describe("Регистрация пользователя, вход в систему, получение токенов", () => {
    it("Should return 400 if dto incorrect", async () => {
      await postRequest(appCoreApp, RouteNames.USERS.REGISTRATION.full)
        .expect(400);

      const badResponse = await postRequest(appCoreApp, RouteNames.USERS.REGISTRATION.full)
        .send(incorrectDtoForRegistation)
        .expect(400)

      // Вытаскиваем текст ошибки из ErrorResponse
      const [nameFieldErrText, passwordFieldErrText, emailFieldErrText] =
        getFieldInErrorObject(badResponse.body, ['username', 'password', 'email'])
      // Берем первый элемент т.к возвращается строка в массиве
      expect(nameFieldErrText[0]).toBe('Username must be at least 6 characters long')
      expect(passwordFieldErrText[0]).toBe('Password must be at least 6 characters long')
      expect(emailFieldErrText[0]).toBe('email must be an email')

    })
    it("Осуществляем регистрацию пользователя в USERS модуле", async () => {
      const response = await postRequest(appCoreApp, RouteNames.USERS.REGISTRATION.full)
        .send(userForTest)
        .expect(201);

      // Проверяем, что возвращенный объект соответствует ожидаемому формату
      expect(response.body).toEqual({
        id: expect.any(String), // UUID
        email: userForTest.email,
        username: userForTest.username,
        firstName: userForTest.firstName,
        lastName: userForTest.lastName,
        city: userForTest.city,
        country: userForTest.country,
        dateOfBirthday: expect.any(String), // Дата
      });
    });

    it("Проверяем наличие пользователя которого создали", async () => {
      const response = await getRequest(appCoreApp, RouteNames.USERS.GET_USER_BY_EMAIL.full + `/${userForTest.email}`)
        .expect(200);

      // Проверяем, что возвращенный объект соответствует ожидаемому формату, эндпоинт далее будет как внутренний, поэтому пока что возвращает Role и PasswordHash
      expect(response.body).toEqual({
        id: expect.any(String), // UUID
        email: userForTest.email,
        username: userForTest.username,
        firstName: userForTest.firstName,
        lastName: userForTest.lastName,
        city: userForTest.city,
        country: userForTest.country,
        password: expect.any(String),
        role: "user",
        dateOfBirthday: expect.any(String), // Дата
        emailConfirmationCode: expect.any(String),
        emailConfirmationCodeExpirationDate: expect.any(String),
        isEmailConfirmed: false
      });
    })

    it('Осуществляем активацию пользователя, верифицируем email', async () => {
      // Получение пользователя после регистрации
      const userAfterRegistration = await getRequest(appCoreApp, RouteNames.USERS.GET_USER_BY_EMAIL.full + `/${userForTest.email}`)

      // Проверка подтверждения email для первого пользователя
      const pathWithQuery = `${RouteNames.USERS.EMAIL_CONFIRMATION.full}?code=${userAfterRegistration.body.emailConfirmationCode}`;    
      const emailConfirmation1 = await getRequest(appCoreApp, pathWithQuery);
      expect(emailConfirmation1.status).toBe(200); // Проверка статуса ответа
      expect(emailConfirmation1.body).toHaveProperty('message', 'Email successfully confirmed'); // Проверка сообщения
  });
    it("Производим вход в систему, получаем токены", async () => {
      // Успешный вход
      const loginResponse = await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
        .send({
          email: userForTest.email,
          password: userForTest.password,
        })
        .expect(200);

      // Проверяем тело ответа
      expect(loginResponse.body).toEqual({
        accessToken: expect.any(String), // Проверяем наличие accessToken
      });

      // Проверяем, что refreshToken установлен в cookie
      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshTokenCookie = cookies?.[0]; // Предположим, что refreshToken — это первая cookie
      globalAccessToken = loginResponse.body.accessToken;
      globalRefreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('refreshToken='); // Проверяем, что cookie содержит refreshToken
      expect(refreshTokenCookie).toContain('HttpOnly'); // Убедимся, что cookie защищены

      // Проверяем формат accessToken
      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
      expect(loginResponse.body.accessToken).toMatch(jwtRegex);

      // Повторный вход (если сессия существует)
      const conflictResponse = await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
        .set('Cookie', refreshTokenCookie) // Отправляем предыдущий refreshToken
        .send({
          email: userForTest.email,
          password: userForTest.password,
        })
        .expect(409);

      expect(conflictResponse.body.message).toBe(
        'Уже существует активная сессия для устройства с этим Refresh Token, если нужно обновить, обратись на refresh-token.',
      );

      // Вход с неверными данными
      await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
        .send({
          email: userForTest.email,
          password: 'WrongPassword123!',
        })
        .expect(401)
        .then((errorResponse) => {
          expect(errorResponse.body.message).toBe('The email or password are incorrect try again please'); // Сообщение об ошибке
        });
    });

    it("Выход из системы, удаление токена, повторный вход (сессия должна быть 1 на устройство)", async () => {
      // Выходим из системы
      await postRequest(appAuth, RouteNames.AUTH.LOGOUT.full)
        .set('Authorization', `Bearer ${globalAccessToken}`)
        .set('Cookie', `refreshToken=${globalRefreshToken}`)
        .expect(200)
        .then((logoutResponse) => {
          expect(logoutResponse.body.message).toBe('Logout successful');
        });

      // Попытка обновления токена после Logout (ожидаем 401 Unauthorized)
      await postRequest(appAuth, RouteNames.AUTH.REFRESH_TOKEN.full)
        .set('Cookie', `refreshToken=${globalRefreshToken}`)
        .expect(401)
        .then((errorResponse) => {
          expect(errorResponse.body.message).toBe('Invalid or expired refresh token');
        });

      // Повторный вход с тем же refreshToken (ожидаем 401 Unauthorized)
      await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
        .set('Cookie', `refreshToken=${globalRefreshToken}`)
        .send({
          email: userForTest.email,
          password: userForTest.password,
        })
        .expect(200);

      // Получаем пользователя по email
      const getUserByEmail = await prismaServiceCoreApp.user.findUnique({
        where: {
          email: userForTest.email,
        },
      });

      // Проверяем количество записей в таблице deviceSession
      const sessionCount = await prismaServiceAuth.deviceSession.count({
        where: {
          userId: getUserByEmail.id,
        },
      });

      // Проверяем, что записей только одна
      expect(sessionCount).toBe(1); // Если записей больше или меньше, тест упадет

    });
  }
  )
});
