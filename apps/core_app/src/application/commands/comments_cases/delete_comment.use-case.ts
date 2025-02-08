import { CommentCreatePayload } from "@app/shared-dto/dtos/comment/comment-create.dto";
import { CommentPublicDto } from "@app/shared-dto/dtos/comment/public-comment.dto";
import { CommentsRepository } from "@core_app/src/infrastructure/modules/comments/comment.repository";
import { CommandHandler } from "@nestjs/cqrs";


export class DeleteCommentCommand {
    constructor(
        public commentId: string,
        public userId: string   
    ) {
    }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase {
    constructor(protected commentsRepository: CommentsRepository,
    ) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const createdComment: boolean = await this.commentsRepository.deletedComment(command.commentId, command.userId);
        return createdComment
    }
}


