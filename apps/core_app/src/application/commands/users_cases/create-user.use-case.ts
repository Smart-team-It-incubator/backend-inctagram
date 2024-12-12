import { CommandHandler } from "@nestjs/cqrs"
import { User } from "@prisma/client"
import { UsersRepository } from "apps/core_app/src/infrastructure/modules/users/repositories/user.repository"
import { CreateUserDto } from "../../dto/CreateUserDto"
import { IUserInterface } from "../../services/user/user-interface"
import { UserViewModel } from "apps/core_app/src/domain/interfaces/view_models/UserViewModel"


export class CreateUserCommand {
    constructor(
        public email: string,
        public password: string,
        public username: string,
        public firstName: string,
        public lastName: string,
        public role?: string,
        public profileImageUrl?: string,
        ) {
    }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: CreateUserCommand): Promise<Partial<UserViewModel>> {
        const user: CreateUserDto = {
            email: command.email,
            password: command.password,
            username: command.username,
            firstName: command.firstName,
            lastName: command.lastName,

        }
        return await this.usersRepository.createUser(user)
    }
}


