import { CommandHandler } from "@nestjs/cqrs"
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { UpdateUserDto } from "@app/shared-dto/dtos/user/update-user.dto";
import { HttpException, HttpStatus } from "@nestjs/common";


export class UpdateUserCommand {
    constructor(
        public userId: string,
        public updateUserDto: UpdateUserDto,
    ) {
    }
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase {
    constructor(protected usersRepository: UsersRepository) { }

    async execute(command: UpdateUserCommand): Promise<Partial<UserViewModel>> {

        try {
            // Проверяем, какие поля пришли
            const fieldsToUpdate = Object.keys(command.updateUserDto).reduce((acc, key) => {
                if (command.updateUserDto[key] !== undefined) {
                    acc[key] = command.updateUserDto[key];
                }
                return acc;
            }, {});

            if (Object.keys(fieldsToUpdate).length === 0) {
                throw new HttpException('No fields provided for update', HttpStatus.BAD_REQUEST);
            }
            //console.log("В репозиторий отдаем",fieldsToUpdate)
            const updateResult = await this.usersRepository.updateUser(command.userId,fieldsToUpdate)
            //console.log(updateResult)
            return updateResult
        }
        catch (error) {
            throw new HttpException('Обновление упало в сервисе, возможно пользователь не существует', HttpStatus.NOT_FOUND);
        }
    }
}

