import { CreatePostDto } from '@app/shared-dto/dtos/post/post-create.dto';
import { CreatePostCommand } from '@core_app/src/application/commands/posts_cases/create-post.use-case';
import { GetPostsCommand } from '@core_app/src/application/commands/posts_cases/get-posts.use-case';
import { UserViewModel } from '@core_app/src/domain/interfaces/view_models/UserViewModel';
import { Controller, Get, Post, Body, HttpException, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesClientService } from '../../config/files-client-proxy';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Posts API') // Группировка в Swagger
@Controller('posts')
export class PostController {
  constructor(private commandBus: CommandBus,
    private filesClientService: FilesClientService
  ) {}

  @ApiOperation({ summary: 'Get all posts' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'Posts successfully received' }) // Описание ответа
  @Get()
  async getAllPosts(): Promise<Partial<UserViewModel>[] | null> {
    const posts: Partial<UserViewModel>[] | null = await this.commandBus.execute(new GetPostsCommand()); 
    if (!posts) {
      throw new HttpException('Posts not found', HttpStatus.BAD_REQUEST);
    }
    return posts;
  }

  @ApiOperation({ summary: 'Create a new post' }) // Описание эндпоинта
  @ApiResponse({ status: 201, description: 'Post successfully created' }) // Описание успешного ответа
  @ApiResponse({ status: 400, description: 'Invalid input data' }) // Описание ошибки
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto): Promise<Partial<UserViewModel>> {
    try {
      const createdPost: Partial<UserViewModel> = await this.commandBus.execute(
        new CreatePostCommand(createPostDto),
      );

      if (!createdPost) {
        throw new HttpException('Failed to create post', HttpStatus.BAD_REQUEST);
      }

      return createdPost;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Post('photosUpload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhotoTest(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesClientService.sendFileToFilesService(file).toPromise(); // Преобразуем Observable в Promise
    console.log("result загрузки:", result);
    return result;
  }
  
}
