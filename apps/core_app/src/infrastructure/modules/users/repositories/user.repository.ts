import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../database/prisma/prisma.service";
import { IUserInterface } from "apps/core_app/src/application/services/user/user-interface";
import { User } from "@prisma/client";
import { CreateUserDto } from "apps/core_app/src/application/dto/CreateUserDto";
import { UserViewModel } from "apps/core_app/src/domain/interfaces/view_models/UserViewModel";


@Injectable()
export class UsersRepository {

    constructor (private readonly prisma: PrismaService
    ) {

    }
    async getUsers(): Promise<{} | null> {
        const users = this.prisma.user.findMany();
        return users
    }

    async createUser(user: CreateUserDto): Promise<Partial<UserViewModel> | null> {
      const { username, email, password, firstName, lastName } = user;
    
      try {
        const createdUser: User = await this.prisma.user.create({
          data: { username, email, password, firstName, lastName },
        });
    
        const userViewModel = new UserViewModel(createdUser);
        return userViewModel.getPublicProfile();
      } catch (error) {
        // Логирование ошибки для анализа
        console.error('Error creating user:', error);
        return null; // Возвращаем null в случае ошибки
      }
    }
    
    
    
}