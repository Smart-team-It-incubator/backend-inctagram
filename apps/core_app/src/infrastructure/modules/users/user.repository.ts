import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel";
import { CreateUserDto } from "@app/shared-dto";
import { Injectable } from "@nestjs/common/decorators/core";
import { User } from "@core_app/src/domain/entities/user-entities";
import { PrismaCoreAppService } from "@core_app/prisma/prisma.service";



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
      const { username, email, password, firstName, lastName, city, country, dateOfBirthday, emailConfirmationCode, emailConfirmationCodeExpirationDate } = user;
      try {
        // Prisma получает только основные поля, остальные генерирует самостоятельно
        const createdUser: User = await this.prisma.user.create({
          data: { username, email, password, firstName, lastName, city, country, dateOfBirthday: new Date(dateOfBirthday), emailConfirmationCode, emailConfirmationCodeExpirationDate },
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
        where: { email: email },
      });
      if (!user) {
        return null;
      }

      const userViewModel = new UserViewModel(user);
      return userViewModel.getPrivateProfile(); // Возвращаем внутренний профиль пользователя, т.к это для нашего ресурса
    }

    async confirmEmail(confirmationCode: string): Promise<Partial<UserViewModel> | null> {
      try {
        // Ищем пользователя по коду подтверждения
        const user = await this.prisma.user.findFirst({ where: { emailConfirmationCode: confirmationCode } });
    
        if (!user) {
          return null; // Если пользователь не найден, возвращаем null
        }
    
        // Обновляем статус пользователя на подтвержденный и удаляем код подтверждения
        const updatedUser = await this.prisma.user.update({
          where: { id: user.id },
          data: { isEmailConfirmed: true, emailConfirmationCode: null },
        });
    
        // Возвращаем обновлённый профиль пользователя
        return new UserViewModel(updatedUser).getPublicProfile();
      } catch (error) {
        throw new Error(`Failed to confirm email: ${error.message}`);
      }
    }
    


    
async dropDb() {
  try {
    // Удаляем данные из каждой таблицы, но структура остаётся
    await this.prisma.$transaction([
      this.prisma.user.deleteMany({}),
      // Добавьте другие таблицы, из которых нужно удалить данные
    ]);
    console.log('Данные успешно удалены из таблиц User');
  } catch (error) {
    console.error('Ошибка при удалении данных:', error);
  }
}
    
    
    
}