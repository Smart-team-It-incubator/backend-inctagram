import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostController } from './post.controller';
import { PostsRepository } from './post.repository';
import { GetPostsUseCase } from '@core_app/src/application/commands/posts_cases/get-posts.use-case';
import { CreatePostUseCase } from '@core_app/src/application/commands/posts_cases/create-post.use-case';


const useCasesPosts = [GetPostsUseCase, CreatePostUseCase]
@Module({
  imports: [CqrsModule,HttpModule,],
  providers: [PrismaCoreAppService, PostsRepository, ...useCasesPosts],
  controllers: [PostController]
})
export class PostModule {}
