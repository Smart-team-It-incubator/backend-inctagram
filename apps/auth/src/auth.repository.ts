import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';  // Для преобразования Observable в Promise

@Injectable()
export class AuthRepository {
  constructor(private httpService: HttpService) {}

  // Пример метода для создания пользователя
  async createUser(userData: any) {
    const response = await firstValueFrom(
      this.httpService.post('http://core_app/api/v1/users', userData)
    );
    return response.data;  // Возвращаем данные, полученные от Core_app
  }

  // Пример метода для получения пользователя по имени
  async getUserByUsername(username: string) {
    const response = await firstValueFrom(
      this.httpService.get(`http://core_app/api/v1/users/${username}`)
    );
    return response.data;  // Возвращаем данные пользователя
  }
}
