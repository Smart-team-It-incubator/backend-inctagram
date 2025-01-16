import { CreatePostDto } from '@app/shared-dto/dtos/post/post-create.dto';
import { CreatePostCommand } from '@core_app/src/application/commands/posts_cases/create-post.use-case';
import { GetPostsCommand } from '@core_app/src/application/commands/posts_cases/get-posts.use-case';
import { UserViewModel } from '@core_app/src/domain/interfaces/view_models/UserViewModel';
import { Controller, Get, Post, Body, HttpException, HttpStatus, UploadedFile, UseInterceptors, Query, Req, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesClientService } from '../../config/files-client-proxy';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostViewModel } from '@core_app/src/application/services/post/post-interface';
import { JwtAuthGuard } from '@app/guards';
import { UpdatePostDto } from '@app/shared-dto/dtos/post/post-update.dto';
import { UpdatePostCommand } from '@core_app/src/application/commands/posts_cases/update-post.use-case';
import { PublicPostDto } from '@app/shared-dto/dtos/post/public-post.dto';
import { DeletePostCommand } from '@core_app/src/application/commands/posts_cases/delete-post.use-case';

@ApiTags('Posts API') // Группировка в Swagger
@Controller('posts')
export class PostController {
  constructor(private commandBus: CommandBus,
    private filesClientService: FilesClientService
  ) {}

  @ApiOperation({ summary: 'Get all posts by userId' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'Posts successfully received', type: [PublicPostDto]}) // Описание ответа
  @ApiResponse({ status: 400, description: 'Posts not found by userId' }) // Описание ошибки
  @Get(':userId') // Указываем параметр пути
  async getAllPostsByUserId(
    @Param('userId') userId: string, // Извлекаем параметр пути
  ): Promise<Partial<PostViewModel>[] | null> {
    const posts: Partial<PostViewModel>[] | null = await this.commandBus.execute(new GetPostsCommand(userId)); 
    if (!posts) {
      throw new HttpException('Posts not found', HttpStatus.BAD_REQUEST);
    }
    return posts;
  }
  

  
  @ApiOperation({ summary: 'Create a new post' }) // Описание эндпоинта
  @ApiResponse({ status: 201, description: 'Post successfully created', type: PublicPostDto }) // Описание успешного ответа
  @ApiResponse({ status: 400, description: 'Invalid input data' }) // Описание ошибки
  @ApiBody({ type: CreatePostDto })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @Req() req): Promise<Partial<UserViewModel>> {
    try {
      const user = req.user; // User Гарантируется токеном
      const createdPost: Partial<UserViewModel> = await this.commandBus.execute(
        new CreatePostCommand(createPostDto, user.id),
      );

      if (!createdPost) {
        throw new HttpException('Failed to create post', HttpStatus.BAD_REQUEST);
      }

      return createdPost;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({summary: 'Update Post - в данный момент меняется только поле TEXT согласно ТЗ'})
  @ApiResponse({status: 200, description: 'Post successfully updated', type: PublicPostDto})
  @ApiResponse({status: 400, description: 'Invalid input data'})
  @ApiBearerAuth('access-token')
  @ApiBody({type: UpdatePostDto})
  @UseGuards(JwtAuthGuard)
  @Put(':postId')
  async updatePost(
    @Req() req,
    @Body() updatePostDto: UpdatePostDto,
    @Param('postId') postId: string,
  ) {
    const user = req.user;
    console.log(postId); // Теперь будет корректно выводить идентификатор поста
    const result = await this.commandBus.execute(new UpdatePostCommand(updatePostDto, user.id, postId));
    if (!result) {
      throw new HttpException('Failed to update post', HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':postId')
  async deletePost(@Req() req, @Param('postId') postId: string) {
    const user = req.user;
    const result = await this.commandBus.execute(new DeletePostCommand(user.id, postId));
    if (!result) {
      throw new HttpException('Failed to delete post', HttpStatus.BAD_REQUEST);
    }
    return result;
  }
  
  @Post('photosUpload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhotoTest(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesClientService.sendFileToFilesService(file).toPromise(); // Преобразуем Observable в Promise
    console.log("result загрузки:", result);
    return result;
  }
  
}
