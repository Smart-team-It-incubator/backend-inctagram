import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "apps/core_app/src/infrastructure/modules/users/repositories/user.repository"
import { UserViewModel } from "apps/core_app/src/domain/interfaces/view_models/UserViewModel"
import { CreateUserDto } from "@app/shared-dto"
import { AuthApiService } from "auth-api/auth-api";


export class CreateUserCommand {
    constructor(
        public email: string,
        public password: string,
        public username: string,
        public firstName: string,
        public lastName: string,
        public city: string, 
        public country: string, 
        public dateOfBirthday: Date,
        public role?: string,
        public profileImageUrl?: string,

        ) {
    }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
    constructor (protected usersRepository: UsersRepository,
        private readonly authApiService: AuthApiService
        
    ) {}

    async execute(command: CreateUserCommand): Promise<Partial<UserViewModel>> {
        const hashedPassword = await this.authApiService.hashPassword(command.password);
        //console.log("hashedPassword", hashedPassword)   
        const user: CreateUserDto = {
            email: command.email,
            password: hashedPassword,
            username: command.username,
            firstName: command.firstName,
            lastName: command.lastName,
            city: command.city,
            country: command.country,
            dateOfBirthday: command.dateOfBirthday
        }
        return await this.usersRepository.createUser(user)
    }
}


