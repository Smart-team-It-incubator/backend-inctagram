import { CommandHandler } from "@nestjs/cqrs"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"


export class GetUsersCommand {
    constructor(
        ) {
        
    }
}

@CommandHandler(GetUsersCommand)
export class GetUsersUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: GetUsersCommand): Promise<Partial<UserViewModel>[] | null> {
        return await this.usersRepository.getUsers()
    }
}


