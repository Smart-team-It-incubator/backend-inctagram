import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"


export class GetUserByGithubIdCommand {
    constructor(
        public githubId: string,
        ) {
    }
}

@CommandHandler(GetUserByGithubIdCommand)
export class GetUserByGithubIdUseCase {
    constructor (protected usersRepository: UsersRepository ) {}

    async execute(command: GetUserByGithubIdCommand): Promise<Partial<UserViewModel>> {
       
        return await this.usersRepository.getUserByGithubId(command.githubId)
    }
}


