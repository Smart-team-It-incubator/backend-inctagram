import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import cookieParser from 'cookie-parser';
import { postRequest } from './utils/common';
import { RouteNames } from '../src/routesConfig/routeNames';
import { clearAllDB } from './utils/clearDB';
import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { UserModule } from '@core_app/src/infrastructure/modules/users/user.module';

describe('Database Connection Test', () => {
  let appAuth: INestApplication;
  let appCoreApp: INestApplication;
  let prismaServiceAuth: PrismaService;
  let prismaServiceCoreApp: PrismaCoreAppService;

  const userForTest = {
    email:"testUser11@gmail.com",
    username: "UserWithHash2",
    password: "Testpassword1!",
    firstName: "Bobby",
    lastName: "Kubob",
    country: "USA",
    city: "New York",
    dateOfBirthday: "2001-01-01"
    }

  beforeAll(async () => {
    const authModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    const coreAppModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    appAuth = authModuleFixture.createNestApplication();
    appCoreApp = coreAppModuleFixture.createNestApplication();

    await appAuth.use(cookieParser());
    await appCoreApp.use(cookieParser());

    await appAuth.init();
    await appCoreApp.init();

    prismaServiceAuth = appAuth.get<PrismaService>(PrismaService);
    prismaServiceCoreApp = appCoreApp.get<PrismaCoreAppService>(PrismaCoreAppService);
  });

  it('should connect to the database AUTH successfully', async () => {
    try {
      await prismaServiceAuth.$connect();
      console.log('Database connected successfully!');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });
  it('should connect to the database CORE_APP successfully', async () => {
    try {
      await prismaServiceCoreApp.$connect();
      console.log('Database connected successfully!');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });

  beforeEach(async () => {
		await clearAllDB(appAuth)
	})

  afterAll(async () => {
    await prismaServiceAuth.$disconnect();
    await prismaServiceCoreApp.$disconnect();
    await appAuth.close();
    await appCoreApp.close();
  });


  describe("Auth flow", () => {

    it("Осуществляем регистрацию пользователя в USERS модуле", async () => {
      console.log("логирование роута для Registration", RouteNames.USERS.REGISTRATION.full )
      await postRequest(appAuth, RouteNames.USERS.REGISTRATION.full)
        .send(userForTest)
        .expect(200);
    })
    it("Производим вход в систему, получаем токены", async () => {
      console.log("логирование роута для Login", RouteNames.AUTH.LOGIN.full )
      await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
        .send({
          email: 'testUser11@gmail.com',
          password: 'Testpassword1!',
        })
        .expect(200);
    })
  }
    )
});
