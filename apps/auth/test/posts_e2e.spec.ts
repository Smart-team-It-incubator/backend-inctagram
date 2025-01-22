import { PrismaService } from "@auth/prisma/prisma.service";
import { app_auth_settings } from "@auth/src/app_auth_settings";
import { AuthModule } from "@auth/src/auth.module";
import { PrismaCoreAppService } from "@core_app/prisma/prisma.service";
import { AppModule } from "@core_app/src/app.module";
import { app_coreApp_settings } from "@core_app/src/infrastructure/app_coreApp_settings";
import { UserModule } from "@core_app/src/infrastructure/modules/users/user.module";
import { INestApplication } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { clearAuthDB, clearCoreDB } from "./utils/clearDB";
import { seedPosts } from "./utils/posts_create";
import { deleteRequest, getRequest, postRequest, putRequest } from "./utils/common";
import { RouteNames } from "@auth/src/routesConfig/routeNames";
import * as bcrypt from 'bcrypt';
import { CreatePostDto } from "@app/shared-dto/dtos/post/post-create.dto";
import { UpdatePostDto } from "@app/shared-dto/dtos/post/post-update.dto";

describe('Post flow', () => {
    jest.setTimeout(30000);
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
        dateOfBirthday: "2001-01-01T00:00:00.000Z"
    }

    const userForTest2 = {
        email: "testUser2@gmail.com",
        username: "UserWithHash2",
        password: "Testpassword2!",
        firstName: "Multi",
        lastName: "Device",
        country: "RUSSIA",
        city: "Moscow",
        dateOfBirthday: "1999-01-01T00:00:00.000Z"
    }

    const postForTest: CreatePostDto = {
        text: "Test post",
        location: "Test location",
        photos: [{
            photoUrl: "https://example.com/photo1.jpg",
            description: "Photo 1"
        }]
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

        // Заполняем БД тестовыми данными чтобы избежать процессов авторизации и создания юзеров, т.к для этого есть другие тесты
        const user = await prismaServiceCoreApp.user.create({
            data:
            {
                ...userForTest1,
                password: await hashPassword(userForTest1.password)
            }
        })
        const user2 = await prismaServiceCoreApp.user.create({
            data:
            {
                ...userForTest2,
                password: await hashPassword(userForTest2.password)
            }
        })
        await seedPosts(prismaServiceCoreApp, user.id)
            .then(() => prismaServiceCoreApp.$disconnect())
            .catch((error) => {
                console.error(error);
                prismaServiceCoreApp.$disconnect();
            });
        await seedPosts(prismaServiceCoreApp, user2.id)
            .then(() => prismaServiceCoreApp.$disconnect())
            .catch((error) => {
                console.error(error);
                prismaServiceCoreApp.$disconnect();
            });
    });

    afterAll(async () => {
        await prismaServiceAuth.$disconnect();
        await prismaServiceCoreApp.$disconnect();
        await appAuth.close();
        await appCoreApp.close();
    })


    describe('Posts Flow', () => {
        jest.setTimeout(30000);

        let tokenGlobal = ""
        // Функция для логина и получения токена
        const loginAndGetToken = async (user: any) => {
            const authResponse = await postRequest(appAuth, RouteNames.AUTH.LOGIN.full)
                .send({ email: user.email, password: userForTest1.password });
            console.log("authResponse:", authResponse)
            return authResponse.body.accessToken;
        };

        // Функция для получения всех постов пользователя
        const getUserPosts = async (userId: string, token: string) => {
            return await getRequest(appCoreApp, RouteNames.POSTS.GET_ALL_POSTS_BY_USERID.full + `/${userId}`)
                .set('Authorization', `Bearer ${token}`);
        };

        // Функция для удаления поста
        const deletePost = async (postId: string, token: string) => {
            return await deleteRequest(appCoreApp, RouteNames.POSTS.DELETE_POST.full + `/${postId}`)
                .set('Authorization', `Bearer ${token}`);
        };

        const createPost = async (createPostDto: CreatePostDto, token: string) => {
            const result = await postRequest(appCoreApp, RouteNames.POSTS.CREATE_NEW_POST.full,)
            .set('Authorization', `Bearer ${token}`)
            .send(createPostDto);  // Отправляем createPostDto в теле запроса
            
            return result
        };

        const updatedPost = async (updatePostDto: UpdatePostDto, postId: string, token: string) => {
            const result = await putRequest(appCoreApp, RouteNames.POSTS.UPDATE_POST.full + `/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatePostDto);  // Отправляем updatePostDto в теле запроса
            
            return result
        }
        
        
        it('Проверяем наличие постов после создания, проверяем что они принадлежат ожидаемому пользователю и отдаются по 8 с пагинацией', async () => {

            await prismaServiceCoreApp.user.update({
                where: { username: userForTest1.username },
                data: { isEmailConfirmed: true },
            });
            const user = await prismaServiceCoreApp.user.findFirst({
                where: { username: userForTest1.username },
            });

            const token = await loginAndGetToken(user);
            tokenGlobal = token

            const postsResponse = await getUserPosts(user.id, token);

            // Проверяем статус ответа
            expect(postsResponse.status).toBe(200);

            // Проверяем, что тело ответа содержит массив
            expect(postsResponse.body).toBeDefined();
            expect(Array.isArray(postsResponse.body)).toBe(true);

            // Проверяем, что количество постов больше 0
            expect(postsResponse.body.length).toBeGreaterThan(0);

            // Проверяем, что каждый пост принадлежит ожидаемому пользователю
            postsResponse.body.forEach((post) => {
                expect(post.userId).toBe(user.id);
            });

            // Проверяем, что количество постов равно 8
            expect(postsResponse.body.length).toEqual(8);
        });

        it('Удаляем 3 поста и проверяем, что их осталось 7', async () => {
            const user = await prismaServiceCoreApp.user.findFirst({
                where: { username: userForTest1.username },
            });



            const token = await loginAndGetToken(user);

            const postsResponseBeforeDelete = await getUserPosts(user.id, token);

            console.log('Количество постов до удаления:', postsResponseBeforeDelete.body.length);

            // Удаляем 3 поста
            const postsToDelete = postsResponseBeforeDelete.body.slice(0, 3); // Выбираем первые 3 поста
            for (const post of postsToDelete) {
                await deletePost(post.id, token);
                console.log(`Удален пост с ID: ${post.id}`);
            }

            const postsResponseAfterDelete = await getUserPosts(user.id, token);

            console.log('Количество постов после удаления:', postsResponseAfterDelete.body.length);

            expect(postsResponseAfterDelete.body.length).toBe(7);

            postsResponseAfterDelete.body.forEach((post) => {
                expect(post.userId).toBe(user.id);
            });
        });
        it('Создаем новый пост, проверяем что количество постов увеличилось', async () => {
            const user = await prismaServiceCoreApp.user.findFirst({
                where: { username: userForTest1.username },
            });
            // Получаем все посты пользователя до создания нового
            const postsResponseBeforeCreate = await getUserPosts(user.id, tokenGlobal);
            console.log('Количество постов до создания:', postsResponseBeforeCreate.body.length);
            // Создаем новый пост
            const response = await createPost(postForTest, tokenGlobal);

            // Получаем все посты пользователя после создания нового
            const postsResponseAfterCreate = await getUserPosts(user.id, tokenGlobal);

            // Логируем количество постов после создания
            console.log('Количество постов после создания:', postsResponseAfterCreate.body.length);

            // Проверяем, что количество постов увеличилось
            expect(postsResponseAfterCreate.body.length).toBeGreaterThan(postsResponseBeforeCreate.body.length);

            // Дополнительно можно проверить, что новый пост был добавлен
            const newPost = postsResponseAfterCreate.body.find(post => post.id === response.body.id);
            expect(newPost).toBeDefined();
            expect(newPost.text).toBe(postForTest.text); // Проверяем, что текст поста совпадает с отправленным
        })
        it ("Обновляем пост и проверяем что текст изменился", async () => {
            const user = await prismaServiceCoreApp.user.findFirst({
                where: { username: userForTest1.username },
            });
            const postsResponseBeforeUpdate = await getUserPosts(user.id, tokenGlobal);
            const postToUpdate = postsResponseBeforeUpdate.body[0];
            postToUpdate.text = "Updated text";
            const updateDto: UpdatePostDto = {
                text: "Updated text"
            }
            const response = await updatedPost(updateDto, postToUpdate.id, tokenGlobal);
            const postsResponseAfterUpdate = await getUserPosts(user.id, tokenGlobal);
            expect(postsResponseAfterUpdate.body[0].text).toBe(postToUpdate.text);
        })
    });
})


const hashPassword = async (password: string) => {
    try {
        const hash = bcrypt.hash(password, 10);
        return hash
    } catch (error) {
        console.error("Error in generateHash:", error.message);
        throw new Error("Hashing failed");
    }
};

