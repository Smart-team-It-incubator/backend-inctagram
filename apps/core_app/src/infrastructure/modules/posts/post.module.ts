import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostController } from './post.controller';
import { PostsRepository } from './post.repository';
import { GetPostsUseCase } from '@core_app/src/application/commands/posts_cases/get-posts.use-case';
import { CreatePostUseCase } from '@core_app/src/application/commands/posts_cases/create-post.use-case';
import { FilesClientService } from '../../config/files-client-proxy';


const useCasesPosts = [GetPostsUseCase, CreatePostUseCase]
@Module({
  imports: [CqrsModule,HttpModule,],
  providers: [PrismaCoreAppService, PostsRepository, ...useCasesPosts, FilesClientService],
  controllers: [PostController],
  exports: []
})
export class PostModule {}
