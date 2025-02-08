import { JwtAuthGuard } from "@app/guards";
import { CommentCreatePayload } from "@app/shared-dto/dtos/comment/comment-create.dto";
import { CommentPublicDto } from "@app/shared-dto/dtos/comment/public-comment.dto";
import { CreateCommentCommand } from "@core_app/src/application/commands/comments_cases/create_comment.use-case";
import { GetCommentsByPostIdCommand } from "@core_app/src/application/queries/comments_query/get_comments.use-case";
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetUser } from "../../utils/get-user.decorator";
import { User } from "@core_app/src/domain/entities/user-entities";
import { DeleteCommentCommand } from "@core_app/src/application/commands/comments_cases/delete_comment.use-case";
import { rmSync } from "fs";

@ApiTags('Comments API') // Группировка в Swagger
@Controller('comments')
export class CommentController {
    constructor(private commandBus: CommandBus,) { }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a comment for a post' })
    @ApiResponse({ status: 201, description: 'Comment created successfully', type: CommentPublicDto })
    @ApiResponse({ status: 400, description: 'Failed to create comment' })
    @ApiBearerAuth('access-token')
    @Post('create/:postId')
    async commentCreate(
        @Body() commentCreatePayload: CommentCreatePayload,
        @GetUser() user: User,
        @Param('postId') postId: string): Promise<CommentPublicDto> {
        console.log("commentCreatePayload", commentCreatePayload, "user", user, "postId", postId);
        const result: CommentPublicDto = await this.commandBus.execute(new CreateCommentCommand(commentCreatePayload.text, user.id, user.username, postId));
        if (!result) throw new HttpException({ message: 'Comment not created' }, HttpStatus.BAD_REQUEST);
        else {
            return result
        }

    }

    @ApiOperation({ summary: 'Get all comments for a post by post ID' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved comments', type: [CommentPublicDto] })
    @ApiResponse({ status: 404, description: 'Comments not found for this post' })
    @Get('get-comments/:postId')
    async getCommentsByPostId(@Param('postId') postId: string): Promise<CommentPublicDto[]> {
        const result: CommentPublicDto[] = await this.commandBus.execute(new GetCommentsByPostIdCommand(postId))
        if (!result) throw new HttpException({ message: 'Comments by post ID not found' }, HttpStatus.NOT_FOUND);
        else {
            return result
        }

    }

    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: 204, description: 'Comment successfully deleted' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiBearerAuth('access-token')
    @HttpCode(204)
    @Delete('delete/:commentId')
    async deleteCommentById(@Param('commentId') commentId: string, @GetUser() user: User): Promise<boolean> {
        //console.log("commentId", commentId, "user", user);  
        try {
            const result = await this.commandBus.execute(new DeleteCommentCommand(commentId, user.id));
            if (!result) {
                throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
            }
            return
        } catch (error) {
            if (error.message === 'Comment not found') {
                throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Failed to delete comment', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

}