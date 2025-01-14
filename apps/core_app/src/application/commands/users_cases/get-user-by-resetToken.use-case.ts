import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"


export class GetUserByResetPasswordTokenCommand {
    constructor(
        public recoveryToken: string,
        ) {
    }
}

@CommandHandler(GetUserByResetPasswordTokenCommand)
export class GetUserByResetPasswordTokenUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: GetUserByResetPasswordTokenCommand): Promise<Partial<UserViewModel>> {
       
        return await this.usersRepository.getUserByResetPasswordToken(command.recoveryToken)
    }
}


