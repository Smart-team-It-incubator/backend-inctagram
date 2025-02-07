import { Module } from "@nestjs/common";
import { CommentController } from "./comment.controller";
import { CreateCommentUseCase } from "@core_app/src/application/commands/comments_cases/create_comment.use-case";
import { GetCommentsByPostIdUseCase } from "@core_app/src/application/queries/comments_query/get_comments.use-case";
import { CommentsRepository } from "./comment.repository";
import { PrismaCoreAppService } from "@core_app/prisma/prisma.service";
import { DeleteCommentUseCase } from "@core_app/src/application/commands/comments_cases/delete_comment.use-case";


const useCasesComments = [CreateCommentUseCase, GetCommentsByPostIdUseCase, DeleteCommentUseCase]

@Module({
  imports: [],
  providers: [...useCasesComments, CommentsRepository, PrismaCoreAppService],
  controllers: [CommentController],
  exports: []
})
export class CommentModule {}
