import { CommentPublicDto } from "@app/shared-dto/dtos/comment/public-comment.dto";
import { CommentsRepository } from "@core_app/src/infrastructure/modules/comments/comment.repository";
import { CommandHandler } from "@nestjs/cqrs";


export class GetCommentsByPostIdCommand {
    constructor(
        public postId: string
    ) {
    }
}

@CommandHandler(GetCommentsByPostIdCommand)
export class GetCommentsByPostIdUseCase {
    constructor(protected commentsRepository: CommentsRepository,
    ) { }

    async execute(command: GetCommentsByPostIdCommand): Promise<CommentPublicDto[]> {
        const result: CommentPublicDto[] = await this.commentsRepository.getCommentsByPostId(command.postId);

        return result 
    }
}


