import { ICommentInterface } from '@core_app/src/application/services/comment/comment-interface';
import { ApiProperty } from '@nestjs/swagger';

export class CommentPublicDto implements ICommentInterface {

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Уникальный идентификатор комментария' })
  id: string;

  @ApiProperty({ example: 'Это мой комментарий!', description: 'Текст комментария' })
  text: string;

  @ApiProperty({ example: '2024-02-07T12:00:00Z', description: 'Дата создания комментария в формате ISO' })
  createdAt: Date;

  @ApiProperty({ example: 'Иван Иванов', description: 'username автора комментария' })
  author: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID пользователя, оставившего комментарий' })
  userId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'ID поста, к которому относится комментарий' })
  postId: string;
}
