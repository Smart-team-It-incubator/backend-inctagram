import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { deleteRequest, getFieldInErrorObject, getRequest, postRequest } from './utils/common';
import { RouteNames } from '../src/routesConfig/routeNames';
import { clearAuthDB, clearCoreDB } from './utils/clearDB';
import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { UserModule } from '@core_app/src/infrastructure/modules/users/user.module';
import { AppModule } from '@core_app/src/app.module';
import { app_auth_settings } from '@auth/src/app_auth_settings';
import { app_coreApp_settings } from '@core_app/src/infrastructure/app_coreApp_settings';

describe('E2e Multidevice Flow', () => {
    jest.setTimeout(20000);
    let appAuth: INestApplication;
    let appCoreApp: INestApplication;
    let prismaServiceAuth: PrismaService;
    let prismaServiceCoreApp: PrismaCoreAppService;

    const userForTest1 = {
        email: "testUser1@gmail.com",
        username: "UserWithHash1",
        password: "Testpassword1!",
        firstName: "Bobby",
        lastName: "Kubob",
        country: "USA",
        city: "New York",
        dateOfBirthday: "2001-01-01"
    }

    const userForTest2 = {
        email: "testUser2@gmail.com",
        username: "UserWithHash2",
        password: "Testpassword2!",
        firstName: "Multi",
        lastName: "Device",
        country: "RUSSIA",
        city: "Moscow",
        dateOfBirthday: "1999-01-01"
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

    let accessTokenUser1 = ''
    let accessTokenUser2 = ''

    let refreshTokenUser1 = ''
    let refreshTokenUser2 = ''

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

    afterAll(async () => {
        await prismaServiceAuth.$disconnect();
        await prismaServiceCoreApp.$disconnect();
        await appAuth.close();
        await appCoreApp.close();
    })

    describe('Multidevice Flow', () => {
        jest.setTimeout(20000);
        it('Осуществляем регистрацию пользователей в USERS модуле', async () => {
            const user1 = await postRequest(appCoreApp, RouteNames.USERS.REGISTRATION.full)
                .send(userForTest1)
                .expect(201);
            const user2 = await postRequest(appCoreApp, RouteNames.USERS.REGISTRATION.full)
                .send(userForTest2)
                .expect(201);
        });

        it('Осуществляем активацию пользователя, верифицируем email', async () => {
            // Получение пользователя после регистрации
            const user1AfterRegistration = await getRequest(appCoreApp, RouteNames.USERS.GET_USER_BY_EMAIL.full + `/${userForTest1.email}`)
            const user2AfterRegistration = await getRequest(appCoreApp, RouteNames.USERS.GET_USER_BY_EMAIL.full + `/${userForTest2.email}`)
            
            // Проверка подтверждения email для первого пользователя
            const pathWithQuery = `${RouteNames.USERS.EMAIL_CONFIRMATION.full}?code=${user1AfterRegistration.body.emailConfirmationCode}`;    
            const emailConfirmation1 = await postRequest(appCoreApp, pathWithQuery);
            expect(emailConfirmation1.status).toBe(201); // Проверка статуса ответа
            expect(emailConfirmation1.body).toHaveProperty('message', 'Email successfully confirmed'); // Проверка сообщения

            // Проверка подтверждения email для второго пользователя
            const pathWithQuery2 = `${RouteNames.USERS.EMAIL_CONFIRMATION.full}?code=${user2AfterRegistration.body.emailConfirmationCode}`;    
            const emailConfirmation2 = await postRequest(appCoreApp, pathWithQuery2);

            expect(emailConfirmation2.status).toBe(201); // Проверка статуса ответа
            expect(emailConfirmation2.body).toHaveProperty('message', 'Email successfully confirmed'); // Проверка сообщения
        });


        it('Осуществляем вход в систему юзерами, получаем токены', async () => {
            const loginResponse1Device1 = await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
                .send({
                    email: userForTest1.email,
                    password: userForTest1.password,
                })
                .expect(200);
            const loginResponse1Device2 = await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
                .send({
                    email: userForTest1.email,
                    password: userForTest1.password,
                })
                .expect(200);

            const loginResponse2Device1 = await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
                .send({
                    email: userForTest2.email,
                    password: userForTest2.password,
                })
                .expect(200);
            const loginResponse2Device2 = await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
                .send({
                    email: userForTest2.email,
                    password: userForTest2.password,
                })
                .expect(200);

            // Сохраняем токены для дальнейших тестов
            accessTokenUser1 = loginResponse1Device1.body.accessToken;

            // Извлекаем куки из заголовков
            const cookiesDevice1User1 = loginResponse1Device1.headers['set-cookie'];
            expect(cookiesDevice1User1).toBeDefined();
            const refreshTokenUser1Device1 = cookiesDevice1User1[0]
                ?.split(';')[0]
                ?.split('=')[1];

            // Второе устройство для User1
            accessTokenUser2 = loginResponse1Device2.body.accessToken;
            const cookiesDevice2User1 = loginResponse1Device2.headers['set-cookie'];
            expect(cookiesDevice2User1).toBeDefined();
            const refreshTokenUser1Device2 = cookiesDevice2User1[0]
                ?.split(';')[0]
                ?.split('=')[1];

            // Первое устройство для User2
            const cookiesDevice1User2 = loginResponse2Device1.headers['set-cookie'];
            expect(cookiesDevice1User2).toBeDefined();
            const refreshTokenUser2Device1 = cookiesDevice1User2[0]
                ?.split(';')[0]
                ?.split('=')[1];

            // Второе устройство для User2
            const cookiesDevice2User2 = loginResponse2Device2.headers['set-cookie'];
            expect(cookiesDevice2User2).toBeDefined();
            const refreshTokenUser2Device2 = cookiesDevice2User2[0]
                ?.split(';')[0]
                ?.split('=')[1];

            // Проверяем, что токены refreshToken для одного пользователя на разных устройствах отличаются
            expect(refreshTokenUser1Device1).not.toEqual(refreshTokenUser1Device2);
            expect(refreshTokenUser2Device1).not.toEqual(refreshTokenUser2Device2);

            // Сохраняем токены для использования в последующих тестах
            refreshTokenUser1 = refreshTokenUser1Device1;
            refreshTokenUser2 = refreshTokenUser2Device1;



            // it('Проверяем доступ с токенами разных устройств', async () => {
            //   // Доступ с первого устройства пользователя 1
            //   await getRequest(appAuth, RouteNames.AUTH.PROTECTED_RESOURCE.full)
            //     .set('Authorization', `Bearer ${accessTokenUser1}`)
            //     .expect(200);

            //   // Доступ с второго устройства пользователя 1
            //   await postRequest(appAuth, RouteNames.AUTH.REFRESH_TOKEN.full)
            //     .send({ refreshToken: refreshTokenUser1 })
            //     .expect(200);

            //   // Доступ с первого устройства пользователя 2
            //   await getRequest(appAuth, RouteNames.AUTH.PROTECTED_RESOURCE.full)
            //     .set('Authorization', `Bearer ${accessTokenUser2}`)
            //     .expect(200);

            //   // Доступ с второго устройства пользователя 2
            //   await postRequest(appAuth, RouteNames.AUTH.REFRESH_TOKEN.full)
            //     .send({ refreshToken: refreshTokenUser2 })
            //     .expect(200);
            // });

            //.set('Cookie', [`refreshToken=${refreshTokenUser2}`])
        });
        it('Получение всех сессий для User1', async () => {
            // Запрос для получения всех сессий
            const sessionsResponse = await getRequest(appAuth, RouteNames.AUTH.GET_ALL_SESSION.full)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .set('Cookie', `refreshToken=${refreshTokenUser1}`) // Передаем refreshToken в Cookie
                .expect(200);

            // Проверяем, что возвращены две сессии
            expect(sessionsResponse.body).toBeDefined();
            expect(Array.isArray(sessionsResponse.body)).toBeTruthy(); // Убедимся, что это массив
            expect(sessionsResponse.body.length).toBe(2); // Убедимся, что возвращено 2 сессии

            // Проверяем структуру сессий
            const [session1, session2] = sessionsResponse.body;
            expect(session1).toHaveProperty('deviceId');
            expect(session1).toHaveProperty('userId');
            expect(session1).toHaveProperty('ip');
            expect(session2).toHaveProperty('deviceId');
            expect(session2).toHaveProperty('userId');
            expect(session2).toHaveProperty('ip');

            // Проверяем, что у каждой сессии уникальный ID
            expect(session1.deviceId).not.toEqual(session2.deviceId);
        });

        it('Получение всех сессий для User2', async () => {
            // Запрос для получения всех сессий
            const sessionsResponse = await getRequest(appAuth, RouteNames.AUTH.GET_ALL_SESSION.full)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .set('Cookie', `refreshToken=${refreshTokenUser2}`) // Передаем refreshToken в Cookie
                .expect(200);

            // Проверяем, что возвращены две сессии
            expect(sessionsResponse.body).toBeDefined();
            expect(Array.isArray(sessionsResponse.body)).toBeTruthy(); // Убедимся, что это массив
            expect(sessionsResponse.body.length).toBe(2); // Убедимся, что возвращено 2 сессии
        });
    })
    it('Отзыв одной сессии для User1 и проверка сессий для User2', async () => {
        // Запрос для получения всех сессий User1 до отзыва
        const sessionsResponseBeforeRevokeUser1 = await getRequest(appAuth, RouteNames.AUTH.GET_ALL_SESSION.full)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .set('Cookie', `refreshToken=${refreshTokenUser1}`)
            .expect(200);

        // Проверяем, что у User1 есть 2 сессии
        expect(sessionsResponseBeforeRevokeUser1.body.length).toBe(2);
        const [session1BeforeRevokeUser1, session2BeforeRevokeUser1] = sessionsResponseBeforeRevokeUser1.body;

        // Отзываем первую сессию User1
        const revokeSessionResponse = await deleteRequest(appAuth, RouteNames.AUTH.DEL_SPECIFIC_SESSION.full.replace(':sessionId', session1BeforeRevokeUser1.id))
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .expect(200);

        // Проверяем, что сессия была успешно отозвана
        expect(revokeSessionResponse.body.message).toBe(`Session ${session1BeforeRevokeUser1.id} revoked successfully.`);

        // Запрос для получения всех сессий User1 после отзыва
        const sessionsResponseAfterRevokeUser1 = await getRequest(appAuth, RouteNames.AUTH.GET_ALL_SESSION.full)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .set('Cookie', `refreshToken=${refreshTokenUser1}`)
            .expect(200);

        // Проверяем, что осталась только одна сессия у User1
        expect(sessionsResponseAfterRevokeUser1.body.length).toBe(1);

        // Проверяем, что в оставшейся сессии идентификатор не совпадает с отозванной
        expect(sessionsResponseAfterRevokeUser1.body[0].id).not.toEqual(session1BeforeRevokeUser1.id);
        expect(sessionsResponseAfterRevokeUser1.body[0].id).toEqual(session2BeforeRevokeUser1.id);

        // Запрос для получения всех сессий User2 до отзыва сессии у User1
        const sessionsResponseBeforeRevokeUser2 = await getRequest(appAuth, RouteNames.AUTH.GET_ALL_SESSION.full)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .set('Cookie', `refreshToken=${refreshTokenUser2}`)
            .expect(200);

        // Проверяем, что у User2 есть 2 сессии
        expect(sessionsResponseBeforeRevokeUser2.body.length).toBe(2);
        const [session1BeforeRevokeUser2, session2BeforeRevokeUser2] = sessionsResponseBeforeRevokeUser2.body;

        // Проверяем, что сессии User2 остались на месте
        const sessionsResponseAfterRevokeUser2 = await getRequest(appAuth, RouteNames.AUTH.GET_ALL_SESSION.full)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .set('Cookie', `refreshToken=${refreshTokenUser2}`)
            .expect(200);

        // Проверяем, что у User2 все сессии остались
        expect(sessionsResponseAfterRevokeUser2.body.length).toBe(2);
        expect(sessionsResponseAfterRevokeUser2.body[0].id).toEqual(session1BeforeRevokeUser2.id);
        expect(sessionsResponseAfterRevokeUser2.body[1].id).toEqual(session2BeforeRevokeUser2.id);
    });
})