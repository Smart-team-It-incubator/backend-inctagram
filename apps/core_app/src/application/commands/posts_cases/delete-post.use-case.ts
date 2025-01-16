import { CommandHandler } from "@nestjs/cqrs"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { PostsRepository } from "@core_app/src/infrastructure/modules/posts/post.repository"
import { PostViewModel } from "../../services/post/post-interface"
import { UpdatePostDto } from "@app/shared-dto/dtos/post/post-update.dto"


export class DeletePostCommand {
    constructor(
        public userId: string,
        public postId: string
        ) {
        
    }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase {
    constructor (protected postsRepository: PostsRepository ) {}

    async execute(command: DeletePostCommand): Promise<boolean | null> {
        return await this.postsRepository.deletePost(command.userId, command.postId)
    }
}


