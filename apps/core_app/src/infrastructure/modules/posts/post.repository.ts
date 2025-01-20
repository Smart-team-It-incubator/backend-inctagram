import { Injectable } from "@nestjs/common/decorators/core";
import { PrismaCoreAppService } from "@core_app/prisma/prisma.service";
import { PostViewModel, IPostInterface } from "@core_app/src/application/services/post/post-interface";
import { CreatePostDto } from "@app/shared-dto/dtos/post/post-create.dto";
import { UpdatePostDto } from "@app/shared-dto/dtos/post/post-update.dto";

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaCoreAppService) { }

  async getAllPostsByUserId(
    userId: string,
    offset: number,
    limit: number
  ): Promise<Partial<PostViewModel>[]> {
    try {
      // Используем `offset` и `limit` для пагинации
      const postWithPhotos = await this.prisma.post.findMany({
        where: {
          userId: userId,
        },
        include: {
          photos: true, // Включаем фотографии
        },
        orderBy: {
          createdAt: 'desc', // Сортируем по дате создания (от новых к старым)
        },
        skip: offset, // Начальная точка выборки
        take: limit,  // Количество постов для выборки
      });
      // Если посты не найдены, выбрасываем ошибку
      if (!postWithPhotos.length) {
        throw new Error('No posts found for the provided user ID');
      }

      // возвращаем их публичную версию
      return postWithPhotos.map((post) => {
        const viewModel = new PostViewModel(post);
        return viewModel.getPublicVersion(); // Возвращаем только публичные данные
      });
    } catch (error) {
      console.error("Error in repository when fetching posts:", error.message);
      throw new Error('Failed to fetch posts'); // Перебрасываем ошибку для верхнего уровня
    }
  }


  async createPost(createPostDto: CreatePostDto, userId: string): Promise<Partial<PostViewModel>> {
    try {
      const { text, location, photos} = createPostDto;

      // Создание нового поста в базе данных
      const createdPost = await this.prisma.post.create({
        data: {
          text,
          location,
          userId,
          photos: {
            // Создание нескольких фотографий для поста из данных из createPostDto.photos
            create: photos.map(photo => ({ url: photo.photoUrl, photoDescription: photo.description })),
        },
        },
        include: {
          photos: true, // Включаем фотографии в результат
        },
      });

      // Преобразуем созданный пост в PostViewModel и возвращаем публичную версию
      return new PostViewModel(createdPost).getPublicVersion();
    } catch (error) {
      console.log("Ошибка в репозитории при создании поста:", error.message);
    }
  }

  async updatePost(updatePostDto: UpdatePostDto, userId: string, postId: string): Promise<Partial<PostViewModel>> {
    try {
      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          ...updatePostDto
        },
        include: { photos: true },
      });

      return new PostViewModel(updatedPost).getPublicVersion();
    } catch (error) {
      console.log("Ошибка в репозитории при обновлении поста:", error.message);
    }

  }

  async deletePost(userId: string, postId: string): Promise<boolean | null> {
    try {
      const deletedPost = await this.prisma.post.delete({
        where: { id: postId },
      });
      return deletedPost ? true : null;
    } catch (error) {
      console.log("Ошибка в репозитории при удалении поста:", error.message);
    }
  }
}