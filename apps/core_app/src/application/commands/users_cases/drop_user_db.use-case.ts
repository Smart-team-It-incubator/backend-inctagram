import { CommandHandler } from "@nestjs/cqrs"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"


export class DropDBCommand {
    constructor(
        ) {
        
    }
}

@CommandHandler(DropDBCommand)
export class DropDBUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: DropDBCommand) {
        return await this.usersRepository.dropDb()
    }
}


