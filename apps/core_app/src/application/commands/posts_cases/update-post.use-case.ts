import { CommandHandler } from "@nestjs/cqrs"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { PostsRepository } from "@core_app/src/infrastructure/modules/posts/post.repository"
import { PostViewModel } from "../../services/post/post-interface"
import { UpdatePostDto } from "@app/shared-dto/dtos/post/post-update.dto"


export class UpdatePostCommand {
    constructor(
        public updatePostDto: UpdatePostDto,
        public userId: string,
        public postId: string
        ) {
        
    }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase {
    constructor (protected postsRepository: PostsRepository ) {}

    async execute(command: UpdatePostCommand): Promise<Partial<PostViewModel> | null> {
        return await this.postsRepository.updatePost(command.updatePostDto,command.userId, command.postId)
    }
}


