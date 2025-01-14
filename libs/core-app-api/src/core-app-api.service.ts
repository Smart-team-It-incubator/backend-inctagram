import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UpdateUserDto } from '@app/shared-dto/dtos/update-user.dto';
import { CreateUserDto } from '@app/shared-dto';

@Injectable()
export class CoreAppApiService {
    private readonly coreAppUrl: string;

    constructor(private readonly httpService: HttpService) {
        // Здесь мы предполагаем, что URL Core_app задается через переменную окружения
        this.coreAppUrl = process.env.CORE_APP_URL || 'http://127.0.0.1:3000';
    }

    // Получение данных пользователя по username
    async getUserByUsername(username: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.coreAppUrl}/users/getByUsername/${username}`),
            );
            return response.data;
        } catch (error) {
            console.error("Ошибка в GetUserByUsername либо Core_app недоступен", error.status, error.config.data);
            return null; // или undefined
        }
    }

        // Получение данных пользователя по Email
        async getUserByEmail(email: string): Promise<any> {
            try {
                const response = await firstValueFrom(
                    this.httpService.get(`${this.coreAppUrl}/users/getByEmail/${email}`),
                );
                return response.data;
            } catch (error) {
                console.error("Ошибка в GetUserByEmail либо Core_app недоступен",error.status, error.config.data); // Логирование ошибки
                return null; // или undefined
            }
        }

        async getUserByGithubId(githubId: string): Promise<any> {
            try {
                const response = await firstValueFrom(
                    this.httpService.get(`${this.coreAppUrl}/users/getByGithubId/${githubId}`),
                );
                return response.data;
            } catch (error) {
                console.error("Ошибка в GetUserByGithubId либо Core_app недоступен",error.status, error.config.data); // Логирование ошибки
                return null; // или undefined
            }
        }

        async updateUser(userId: string, UpdateUserDto: UpdateUserDto): Promise<any> {
            try {
                console.log("Мы попали в библиотеку, метод UpdateUser", userId, UpdateUserDto);
                const response = await firstValueFrom(
                    this.httpService.put(`${this.coreAppUrl}/users/update/${userId}`,
                        UpdateUserDto // Передаем данные в тело запроса
                    ),
                );
                return response.data;
            } catch (error) {
                console.error("Ошибка в UpdateUser либо Core_app недоступен",error.status, error.config.data); // Логирование ошибки
                return null; // или undefined
            }
        }

        async registerUserByGithub(githubUser: CreateUserDto): Promise<any> {
            try {
                const response = await firstValueFrom(
                    this.httpService.post(`${this.coreAppUrl}/users/registration`, githubUser),
                );
                return response.data;
            } catch (error) {
                console.error("Ошибка в RegisterUser либо Core_app недоступен",error.status, error.config.data); // Логирование ошибки
                return null; // или undefined
            }
        }

        async getUserByResetPasswordToken (recoveryCode: string): Promise<any> {
            try {
                const response = await firstValueFrom(
                    this.httpService.get(`${this.coreAppUrl}/users/getByResetPasswordToken/${recoveryCode}`),
                );
                return response.data;
            } catch (error) {
                console.error("Ошибка в GetUserByResetPasswordToken либо Core_app недоступен",error.status, error.config.data); // Логирование ошибки
                return null; // или undefined
            }
        }
}
