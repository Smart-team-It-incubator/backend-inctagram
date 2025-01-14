import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePostDto } from '@app/shared-dto/dtos/post/post-create.dto';
import { PostsRepository } from '@core_app/src/infrastructure/modules/posts/post.repository';
import { PostViewModel, IPostInterface } from '../../services/post/post-interface';

export class CreatePostCommand {
  constructor(public readonly postDto: CreatePostDto) {}
}

@Injectable()
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const { postDto } = command;

    try {
      // Вызов метода создания поста в репозитории
      const createdPost = await this.postsRepository.createPost(postDto);

      if (!createdPost) {
        throw new HttpException('Failed to create post', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Убедимся, что все обязательные поля заполнены
      const completePost: IPostInterface = {
        id: createdPost.id!,
        text: createdPost.text!,
        location: createdPost.location!,
        createdAt: new Date(createdPost.createdAt), // Преобразуем строку в Date
        userId: createdPost.userId!,
      };

      // Возвращаем ViewModel поста
      return new PostViewModel(completePost);
    } catch (error) {
      throw new HttpException(error.message || 'Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
