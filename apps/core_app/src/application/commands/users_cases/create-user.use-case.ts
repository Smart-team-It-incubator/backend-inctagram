import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "apps/core_app/src/infrastructure/modules/users/repositories/user.repository"


export class CreateUserCommand {
    constructor(
        public email: string,
        public name: string
        ) {
    }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: CreateUserCommand): Promise<{} | null> {
        return await this.usersRepository.createUser(command.email, command.name)
    }
}


