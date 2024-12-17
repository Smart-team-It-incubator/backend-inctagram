import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "apps/core_app/src/infrastructure/modules/users/repositories/user.repository"
import { UserViewModel } from "apps/core_app/src/domain/interfaces/view_models/UserViewModel"


export class GetUserByEmailCommand {
    constructor(
        public email: string,
        ) {
    }
}

@CommandHandler(GetUserByEmailCommand)
export class GetUserByEmailUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: GetUserByEmailCommand): Promise<Partial<UserViewModel>> {
       
        return await this.usersRepository.getUserByEmail(command.email)
    }
}


