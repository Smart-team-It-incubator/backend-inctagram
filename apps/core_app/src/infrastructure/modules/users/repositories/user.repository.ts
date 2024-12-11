import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../database/prisma/prisma.service";


@Injectable()
export class UsersRepository {

    constructor (private readonly prisma: PrismaService
    ) {

    }
    async getUsers(): Promise<{} | null> {
        const users = this.prisma.user.findMany();
        return users
    }

    async createUser(email: string, login: string): Promise<{}| null> {
        const createdUser = this.prisma.user.create({
            data: { email, login },
          });
        return createdUser
      }
    
}