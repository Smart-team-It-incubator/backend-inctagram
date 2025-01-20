import { CreatePostDto } from '@app/shared-dto/dtos/post/post-create.dto';
import { CreatePostCommand } from '@core_app/src/application/commands/posts_cases/create-post.use-case';
import { GetPostsCommand } from '@core_app/src/application/commands/posts_cases/get-posts.use-case';
import { UserViewModel } from '@core_app/src/domain/interfaces/view_models/UserViewModel';
import { Controller, Get, Post, Body, HttpException, HttpStatus, UploadedFile, UseInterceptors, Query, Req, UseGuards, Put, Param, Delete, UploadedFiles } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesClientService } from '../../config/files-client-proxy';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PostViewModel } from '@core_app/src/application/services/post/post-interface';
import { JwtAuthGuard } from '@app/guards';
import { UpdatePostDto } from '@app/shared-dto/dtos/post/post-update.dto';
import { UpdatePostCommand } from '@core_app/src/application/commands/posts_cases/update-post.use-case';
import { PublicPostDto } from '@app/shared-dto/dtos/post/public-post.dto';
import { DeletePostCommand } from '@core_app/src/application/commands/posts_cases/delete-post.use-case';
import { FileSizeValidationPipe } from '../../config/files-pipe';

@ApiTags('Posts API') // Группировка в Swagger
@Controller('posts')
export class PostController {
  constructor(private commandBus: CommandBus,
    private filesClientService: FilesClientService
  ) { }

  @ApiOperation({ summary: 'Get all posts by userId' })  // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'Posts successfully received', type: [PublicPostDto] })  // Описание успешного ответа
  @ApiResponse({ status: 400, description: 'Posts not found by userId' })  // Описание ошибки
  @ApiResponse({ status: 500, description: 'Internal server error' })  // Описание ошибки сервера
  @Get(':userId')  // Указываем параметр пути
  async getAllPostsByUserId(
    @Param('userId') userId: string,  // Извлекаем параметр пути
    @Query('offset') offset = 0,
    @Query('limit') limit = 8,
  ): Promise<Partial<PostViewModel>[] | null> {


    try {
      // Выполняем команду, передавая userId, offset и limit
      const posts = await this.commandBus.execute(new GetPostsCommand(userId, offset, limit));

      // Если постов нет, выбрасываем ошибку
      if (!posts || posts.length === 0) {
        throw new HttpException('Posts not found', HttpStatus.BAD_REQUEST);
      }

      // Возвращаем посты
      return posts;
    } catch (error) {
      // Обработка ошибок
      console.error('Error fetching posts:', error.message);
      throw new HttpException('Failed to fetch posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @ApiOperation({ summary: 'Create a new post' }) // Описание эндпоинта
  @ApiResponse({ status: 201, description: 'Post successfully created', type: PublicPostDto }) // Описание успешного ответа
  @ApiResponse({ status: 400, description: 'Invalid input data' }) // Описание ошибки
  @ApiBody({ type: CreatePostDto })
  @ApiBearerAuth('access-token')
  //Валидация на количество файлов (10) и формат (PNG или JPEG)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 20 * 1024 * 1024 }, // Максимум 20 MB на файл
      fileFilter: (req, file, cb) => {
        // Разрешаем только изображения формата JPEG и PNG
        if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
          return cb(
            new HttpException('The photo must be in JPEG or PNG format', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Partial<UserViewModel>> {
    try {
      //console.log(files); // Проверьте, выводятся ли здесь файлы
      const user = req.user;
      // Загружаем фото через Files микросервис
      const uploadedPhotos = await Promise.all(
        files.map(async (file) => {
          try {
            const uploadedPhoto = await this.filesClientService.validateAndUploadPhoto(file.buffer);
            //console.log("uploadedPhoto:",uploadedPhoto)
            return {
              photoUrl: uploadedPhoto.url,

              // TODO -  Придумать как передать сюда не имя файла, а описание от Frontend
              description: file?.originalname || 'empty description',
            };
          } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
          }
        }),
      );

      // Передаём ссылки на фото
      createPostDto.photos = uploadedPhotos;
      //console.log("Так выглядит createPostDto после обработки", createPostDto)

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


  @ApiOperation({ summary: 'Update Post - в данный момент меняется только поле TEXT согласно ТЗ' })
  @ApiResponse({ status: 200, description: 'Post successfully updated', type: PublicPostDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdatePostDto })
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
  @ApiBearerAuth('access-token') // Указывает, что запрос требует Bearer токен
  @ApiOperation({ summary: 'Удалить пост' }) // Описание операции
  @ApiParam({
    name: 'postId',
    required: true,
    description: 'ID поста для удаления',
    type: String,
  }) // Параметр пути
  @ApiResponse({
    status: 200,
    description: 'Пост успешно удалён.',
  })
  @ApiResponse({
    status: 400,
    description: 'Не удалось удалить пост.',
  })
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
