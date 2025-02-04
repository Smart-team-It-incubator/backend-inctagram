import { CommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository";
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel";
import { HttpException, HttpStatus } from "@nestjs/common";
import { FilesClientService } from "@core_app/src/infrastructure/config/files-client-proxy";

export class UpdateAvatarCommand {
    constructor(
        public userId: string,
        public file: Express.Multer.File, // <-- Изменено на правильный тип
    ) {}
}

@CommandHandler(UpdateAvatarCommand)
export class UpdateAvatarUseCase {
    constructor(
        private usersRepository: UsersRepository, 
        private filesClientService: FilesClientService
    ) {}

    async execute(command: UpdateAvatarCommand): Promise<Partial<UserViewModel>> {
        try {
            // Загружаем фото
            const avatarUpload = await this.filesClientService.validateAndUploadPhoto(command.file.buffer);
            
            if (!avatarUpload) {
                throw new HttpException({ message: 'Фото не прошло валидацию' }, HttpStatus.BAD_REQUEST);
            }

            // Обновляем аватар пользователя
            const updateUser = await this.usersRepository.updateAvatar(command.userId, avatarUpload.url);
            return updateUser;
        } catch (error) {
            throw new HttpException({ message: 'Обновление аватара упало в сервисе, возможно пользователь не существует' }, HttpStatus.NOT_FOUND);
        }
    }
}
