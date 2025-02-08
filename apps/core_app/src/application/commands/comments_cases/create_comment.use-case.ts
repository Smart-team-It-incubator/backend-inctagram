import { CommentCreatePayload } from "@app/shared-dto/dtos/comment/comment-create.dto";
import { CommentPublicDto } from "@app/shared-dto/dtos/comment/public-comment.dto";
import { CommentsRepository } from "@core_app/src/infrastructure/modules/comments/comment.repository";
import { CommandHandler } from "@nestjs/cqrs";


export class CreateCommentCommand {
    constructor(
        public comment: string,
        public userId: string,
        public username: string,
        public postId: string
    ) {
    }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase {
    constructor(protected commentsRepository: CommentsRepository,
    ) { }

    async execute(command: CreateCommentCommand): Promise<Partial<CommentPublicDto>> {
        const createdComment: CommentPublicDto = await this.commentsRepository.createComment(command.comment, command.userId, command.postId, command.username);
        return createdComment
    }
}


