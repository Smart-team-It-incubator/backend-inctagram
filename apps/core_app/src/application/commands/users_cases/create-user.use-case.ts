import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { CreateUserDto } from "@app/shared-dto"
import { AuthApiService } from "auth-api/auth-api";
import { EmailAdapterService } from "@app/email-service";
import { v4 as uuidv4 } from 'uuid';

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
    constructor(protected usersRepository: UsersRepository,
        private readonly authApiService: AuthApiService,
        private readonly emailService: EmailAdapterService

    ) { }

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
            dateOfBirthday: command.dateOfBirthday,
            emailConfirmationCode: uuidv4(), // Генерация уникального UUID кода
            emailConfirmationCodeExpirationDate: new Date(Date.now() + 5 * 60 * 1000), // Установка даты истечения (5 минут от текущего времени)
        }
        const createdUserView = await this.usersRepository.createUser(user)
        if (createdUserView === null) {
            return null // Проверяем, если пользователь не создан, то отправлять email не нужно
        }
        // Отправляем email, если включена отправка
        await this.emailService.sendEmailConfirmationMessage(command.email, user.emailConfirmationCode)

        return createdUserView
    }
}


