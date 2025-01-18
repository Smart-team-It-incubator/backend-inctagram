import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { UpdateUserDto } from "@app/shared-dto/dtos/user/update-user.dto";
import { HttpException, HttpStatus } from "@nestjs/common";


export class DeleteUserCommand {
    constructor(
        public userId: string,
    ) {
    }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
    constructor(protected usersRepository: UsersRepository) { }

    async execute(command: DeleteUserCommand): Promise<Partial<UserViewModel>> {

        try {

            const deleteResult = await this.usersRepository.deleteUser(command.userId)
            //console.log(updateResult)
            return deleteResult
        }
        catch (error) {
            throw new HttpException('Обновление упало в сервисе, возможно пользователь не существует', HttpStatus.NOT_FOUND);
        }
    }
}

