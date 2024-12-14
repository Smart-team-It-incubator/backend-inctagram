import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "apps/core_app/src/infrastructure/modules/users/repositories/user.repository"
import { UserViewModel } from "apps/core_app/src/domain/interfaces/view_models/UserViewModel"


export class GetUserByUsernameCommand {
    constructor(
        public username: string,
        ) {
    }
}

@CommandHandler(GetUserByUsernameCommand)
export class GetUserByUsernameUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: GetUserByUsernameCommand): Promise<Partial<UserViewModel>> {
       
        return await this.usersRepository.getUserByUsername(command.username)
    }
}


