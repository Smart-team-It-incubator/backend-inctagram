import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "apps/core_app/src/infrastructure/modules/users/repositories/user.repository"


export class GetUsersCommand {
    constructor(
        ) {
        
    }
}

@CommandHandler(GetUsersCommand)
export class GetUsersUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: GetUsersCommand): Promise<{} | null> {
        return await this.usersRepository.getUsers()
    }
}


