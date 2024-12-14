import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoreAppApiService {
    private readonly coreAppUrl: string;

    constructor(private readonly httpService: HttpService) {
        // Здесь мы предполагаем, что URL Core_app задается через переменную окружения
        this.coreAppUrl = process.env.CORE_APP_URL || 'http://localhost:3000';
    }

    // Получение данных пользователя по username
    async getUserByUsername(username: string): Promise<any> {
        try {
            //console.log("мы в библиотеке", this.coreAppUrl);
            const response = await firstValueFrom(
                this.httpService.get(`${this.coreAppUrl}/users/${username}`),
            );
            //console.log(response.data);
            return response.data;
        } catch (error) {
            throw new HttpException(
                'User not found or Core_app unavailable',
                HttpStatus.NOT_FOUND,
            );
        }
    }
}
