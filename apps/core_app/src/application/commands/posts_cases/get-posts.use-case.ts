import { CommandHandler } from "@nestjs/cqrs"
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel"
import { PostsRepository } from "@core_app/src/infrastructure/modules/posts/post.repository"
import { PostViewModel } from "../../services/post/post-interface"


export class GetPostsCommand {
    constructor(
      public userId: string,
      public pageSize: number,
      public pageNumber: number,
    ) {}
}

@CommandHandler(GetPostsCommand)
export class GetPostsUseCase {
    constructor(protected postsRepository: PostsRepository) {}

    async execute(command: GetPostsCommand): Promise<Partial<PostViewModel>[] | null> {
        const { userId, pageSize, pageNumber } = command;
        return await this.postsRepository.getAllPostsByUserId(userId, pageNumber, pageSize);
    }
}

