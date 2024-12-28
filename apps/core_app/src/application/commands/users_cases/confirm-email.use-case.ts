import { CommandHandler } from "@nestjs/cqrs"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"


export class ConfirmEmailCommand {
    constructor(
        public readonly confirmationCode: string
        ) {
        
    }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: ConfirmEmailCommand): Promise<Partial<UserViewModel> | null> {
        return await this.usersRepository.confirmEmail(command.confirmationCode)
    }
}


