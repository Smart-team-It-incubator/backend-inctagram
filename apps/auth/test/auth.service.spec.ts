import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import cookieParser from 'cookie-parser';
import { getRequest, postRequest } from './utils/common';
import { RouteNames } from '../src/routesConfig/routeNames';
import { clearAuthDB, clearCoreDB } from './utils/clearDB';
import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { UserModule } from '@core_app/src/infrastructure/modules/users/user.module';
import { AppModule } from '@core_app/src/app.module';
import { app_auth_settings } from '@auth/src/app_auth_settings';
import { app_coreApp_settings } from '@core_app/src/infrastructure/app_coreApp_settings';

describe('E2E registration user/auth flow', () => {
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
    email: "wrong-email",
    username: "UserWithHash2",
    password: "bad",
    firstName: "Bobby",
    lastName: "Kubob",
    country: "USA",
    city: "New York",
    dateOfBirthday: "2001-01-01"
  }

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

    // Применяем настройки из функции
    await app_auth_settings(appAuth);
    await app_coreApp_settings(appCoreApp);
    

    // appAuth.setGlobalPrefix('api/v1');
    // appCoreApp.setGlobalPrefix('api/v1');

    // appAuth.use(cookieParser());
    // appCoreApp.use(cookieParser());

    // await appAuth.init();
    // await appCoreApp.init();
    // await appAuth.listen(4000);
    // await appCoreApp.listen(3000);

    prismaServiceAuth = appAuth.get<PrismaService>(PrismaService);
    prismaServiceCoreApp = appCoreApp.get<PrismaCoreAppService>(PrismaCoreAppService);

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


  describe("Проверяем доступность основных приложений", () => {
    jest.setTimeout(20000);

    it('should return 200 from the Auth application', async () => {
      const response = await getRequest(appAuth, "api/v1/auth/health")
        .expect(200);
    });


    it('should return 200 from the Core_app application', async () => {

      const response = await getRequest(appCoreApp, "api/v1/users/health")
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

      console.log(badResponse.body)

    })
    it("Осуществляем регистрацию пользователя в USERS модуле", async () => {
      await postRequest(appCoreApp, RouteNames.USERS.REGISTRATION.full)
        .send(userForTest)
        .expect(201);
    })
    it("Проверяем наличие пользователя которого создали", async () => {
      await getRequest(appCoreApp, RouteNames.USERS.GET_USER_BY_EMAIL.full + `/${userForTest.email}`)
        .expect(200);
    })
    it("Производим вход в систему, получаем токены", async () => {
      await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
        .send({
          email: userForTest.email,
          password: userForTest.password,
        })
        .expect(200);
    })
  }
  )

});
