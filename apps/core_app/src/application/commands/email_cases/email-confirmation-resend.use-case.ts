import { EmailAdapterService } from "@app/email-service";
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel";
import { UsersRepository } from "@core_app/src/infrastructure/modules/users/user.repository";
import { CommandHandler } from "@nestjs/cqrs";
import { v4 as uuidv4 } from 'uuid';

export class ResendConfirmationCodeCommand {
    constructor(
        public email: string
    ) {
    }
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase {
    constructor(protected usersRepository: UsersRepository,
        private readonly emailService: EmailAdapterService
    ) { }

    async execute(command: ResendConfirmationCodeCommand): Promise<boolean | null> {
        const user = await this.usersRepository.getUserByEmail(command.email);
        // Проверяем наличие юзера + проверяем его активацию, если он уже активен, отсылать email нет смысла
        if (!user || user.isEmailConfirmed) {
        
            return null;
        }
        const userUpdate = {
            emailConfirmationCode: uuidv4(), // Генерация уникального UUID кода
            emailConfirmationCodeExpirationDate: new Date(Date.now() + 5 * 60 * 1000), // Установка даты истечения (5 минут от текущего времени)
        }
        // Обновляем юзеру код активации + обновляем таймер кода
        const resultUserUpdate = await this.usersRepository.updateUser(user.id, userUpdate)
        if (resultUserUpdate === null) {
            return null // Проверяем, если пользователь не создан, то отправлять email не нужно
        }

        // Запуск отправки Email в фоне, т.к возможно из-за VPN проблемы связи с email-server, для повторной отправки сделаем Email-Resending
        this.emailService.sendEmailConfirmationMessage(command.email, resultUserUpdate.emailConfirmationCode).catch((error) => {
            console.error('Failed to send email:', error);
        });

        return true
    }
}


