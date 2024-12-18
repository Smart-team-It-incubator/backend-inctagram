import { UserViewModel } from "apps/core_app/src/domain/interfaces/view_models/UserViewModel";
import { CreateUserDto } from "@app/shared-dto";
import { Injectable } from "@nestjs/common/decorators/core";
import { User } from "apps/core_app/src/domain/entities/user-entities";
import { PrismaCoreAppService } from "apps/core_app/prisma/prisma.service";



@Injectable()
export class UsersRepository {

    constructor (private readonly prisma: PrismaCoreAppService
    ) {

    }
    async getUsers(): Promise<Partial<UserViewModel>[] | null> {
      const users = await this.prisma.user.findMany();
      if (!users) {
        return null;
      }
    
      // Преобразуем каждый найденный пользователь в UserViewModel и вызываем getPublicProfile для корректного формата
      const userViewModels = users.map(user => new UserViewModel(user).getPublicProfile());
      
      return userViewModels;
    }
    

    async createUser(user: CreateUserDto): Promise<Partial<UserViewModel> | null> {
      // Создание переменных на основании User сущности для Prisma
      const { username, email, password, firstName, lastName, city, country, dateOfBirthday } = user;
      console.log(password)
      try {
        // Prisma получает только основные поля, остальные генерирует самостоятельно
        const createdUser: User = await this.prisma.user.create({
          data: { username, email, password, firstName, lastName, city, country, dateOfBirthday: new Date(dateOfBirthday) },
        });
        // Отдаем публичный профиль в заранее определенном формате
        const userViewModel = new UserViewModel(createdUser);
        return userViewModel.getPublicProfile();
      } catch (error) {
        // Логирование ошибки для анализа
        console.error('Error creating user:', error);
        return null; // Возвращаем null в случае ошибки
      }
    }


    async getUserByUsername(username: string): Promise<Partial<UserViewModel> | null> {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        return null;
      }

      const userViewModel = new UserViewModel(user);
      return userViewModel.getPrivateProfile(); // Возвращаем внутренний профиль пользователя, т.к это для нашего ресурса
    }

    async getUserByEmail(email: string): Promise<Partial<UserViewModel> | null> {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        return null;
      }

      const userViewModel = new UserViewModel(user);
      return userViewModel.getPrivateProfile(); // Возвращаем внутренний профиль пользователя, т.к это для нашего ресурса
    }
    
    
    
    
}