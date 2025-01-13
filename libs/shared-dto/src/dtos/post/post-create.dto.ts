import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Text content of the post',
    example: 'This is a sample post text',
  })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: 'Location associated with the post',
    example: 'New York, USA',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'ID of the user creating the post',
    example: '123e4567-e89b-12d3-a456-426614174000', // Пример UUID
  })
  @IsString()
  userId: string;
}
