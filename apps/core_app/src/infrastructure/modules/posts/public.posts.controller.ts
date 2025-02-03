import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, HttpException, HttpStatus, Param, Query } from "@nestjs/common";
import { PostsRepository } from "@core_app/src/infrastructure/modules/posts/post.repository";
import { PublicPostDto } from "@app/shared-dto/dtos/post/public-post.dto";
import { PostViewModel } from "@core_app/src/application/services/post/post-interface";
import { UpdatePostCommand } from "@core_app/src/application/commands/posts_cases/update-post.use-case";

@ApiTags('Public API')
@Controller('public')
export class PublicController {
  constructor(private readonly postRepository: PostsRepository) {}

  @ApiOperation({ summary: 'Get public posts' })
  @ApiResponse({ status: 200, description: 'Public posts successfully retrieved', type: [PublicPostDto] })
  @Get('posts')
  async getPublicPosts(
    @Query('pageNumber') pageNumber = 1,
    @Query('pageSize') pageSize = 4
  ): Promise<Partial<PostViewModel>[]> {
    return this.postRepository.getPosts(pageNumber, pageSize);
  }

  @ApiOperation({ summary: 'Get public post by ID' })
  @ApiResponse({ status: 200, description: 'Public post successfully retrieved', type: PublicPostDto })
  @Get('posts/:postId')
  async getPostById(@Param('postId') postId: string): Promise<Partial<PostViewModel>> {
    return this.postRepository.getPostById(postId);
    const result = await this.postRepository.getPostById(postId);
    if (!result) {
      throw new HttpException({message: 'Failed to update post'}, HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @ApiOperation({ summary: 'Get public user profile' })
  @ApiResponse({ status: 200, description: 'Public user profile successfully retrieved' })
  @Get('profiles/:userId')
  async getUserProfile(@Param('userId') userId: string): Promise<any> {
    return this.postRepository.getUserProfile(userId);
  }
}