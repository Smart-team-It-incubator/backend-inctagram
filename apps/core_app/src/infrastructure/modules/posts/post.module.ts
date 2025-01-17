import { PrismaCoreAppService } from '@core_app/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostController } from './post.controller';
import { PostsRepository } from './post.repository';
import { GetPostsUseCase } from '@core_app/src/application/commands/posts_cases/get-posts.use-case';
import { CreatePostUseCase } from '@core_app/src/application/commands/posts_cases/create-post.use-case';
import { FilesClientService } from '../../config/files-client-proxy';
import { JwtService } from '@nestjs/jwt';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { UpdatePostUseCase } from '@core_app/src/application/commands/posts_cases/update-post.use-case';
import { DeletePostUseCase } from '@core_app/src/application/commands/posts_cases/delete-post.use-case';


const useCasesPosts = [GetPostsUseCase, CreatePostUseCase, UpdatePostUseCase, DeletePostUseCase]
@Module({
  imports: [CqrsModule,HttpModule,],
  providers: [PrismaCoreAppService, PostsRepository, ...useCasesPosts, FilesClientService, JwtService, CoreAppApiService],
  controllers: [PostController],
  exports: []
})
export class PostModule {}
