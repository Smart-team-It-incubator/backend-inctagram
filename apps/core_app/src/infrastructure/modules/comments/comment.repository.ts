import { CommentPublicDto } from "@app/shared-dto/dtos/comment/public-comment.dto";
import { PrismaCoreAppService } from "@core_app/prisma/prisma.service";
import { Injectable } from "@nestjs/common";


@Injectable()
export class CommentsRepository {
    constructor(private readonly prisma: PrismaCoreAppService) {

    }

    async createComment(text: string, userId: string, postId: string, username: string): Promise<CommentPublicDto> {
        try {
            const createdComment: CommentPublicDto = await this.prisma.comment.create({
                data:
                {
                    comment_author: username,
                    user: { connect: { id: userId } },
                    post: { connect: { id: postId } },
                    text
                }
            });
            return createdComment
        } catch (error) {

        }

    }

    async getCommentsByPostId(postId: string): Promise<CommentPublicDto[]> {
        try {
            const comments = await this.prisma.comment.findMany({ where: { postId: postId } })
            return comments
        } catch (error) {
            console.log(error)
            throw new Error('Failed to get comments by ID');
        }

    }

    async deletedComment(commentId: string, userId: string): Promise<boolean> {
        try {
            const deletedComment = await this.prisma.comment.delete({ where: { id: commentId, userId: userId }});
            return deletedComment ? true : false;
        } catch (error) {
            if (error.code === 'P2025') {
                // Выбрасываем ошибку, которая будет обработана на уровне сервиса/контроллера
                throw new Error('Comment not found');
            }
            throw new Error('Failed to delete comment');
        }
    }
}