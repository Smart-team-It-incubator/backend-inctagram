import { Injectable } from "@nestjs/common/decorators/core";
import { PrismaCoreAppService } from "@core_app/prisma/prisma.service";
import { PostViewModel, IPostInterface } from "@core_app/src/application/services/post/post-interface";
import { CreatePostDto } from "@app/shared-dto/dtos/post/post-create.dto";

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaCoreAppService) {}

  async getAllPosts(): Promise<Partial<PostViewModel>[]> {
    const posts = await this.prisma.post.findMany();

    // Преобразуем каждый найденный пост в PostViewModel и вызываем getPublicVersion для корректного формата
    return posts.map((post) => new PostViewModel(post).getPublicVersion());
  }

  async createPost(createPostDto: CreatePostDto): Promise<Partial<PostViewModel>> {
    const { text, location, userId } = createPostDto;

    // Создание нового поста в базе данных
    const createdPost = await this.prisma.post.create({
      data: {
        text,
        location,
        userId,
      },
    });

    // Преобразуем созданный пост в PostViewModel и возвращаем публичную версию
    return new PostViewModel(createdPost).getPublicVersion();
  }
}