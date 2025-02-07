import { ApiProperty } from '@nestjs/swagger';

export class PublicPostDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the post',
  })
  id: string;

  @ApiProperty({
    example: 'This is a sample post text.',
    description: 'Content of the post',
  })
  text: string;

  @ApiProperty({
    example: 'New York',
    description: 'Location associated with the post',
  })
  location: string;

  @ApiProperty({
    example: '2025-01-16T06:55:56.655Z',
    description: 'Date and time when the post was created',
    required: false,
  })
  createdAt?: string;

  @ApiProperty({
    example: '18d2730d-a9d5-4826-9417-e9f428528ad3',
    description: 'Identifier of the user who created the post',
  })
  userId: string;
  @ApiProperty({
    example: 'John Doe',
    description: 'username of the user who created the post',
  })
  author: string;

  @ApiProperty({
    example: [
      {
        id: '18d2730d-a9d5-4826-9417-e9f428528ad2',
        url: 'https://s3.bucket/photo1.jpg',
        photoDescription: 'Photo of a sunset',
      },
      {
        id: '18d2730d-a9d5-4826-9417-e9f428528ad4',
        url: 'https://s3.bucket/photo2.jpg',
        photoDescription: null,
      },
    ],
    description: 'List of photos associated with the post',
    required: false,
  })
  photos?: { id: string; url: string; photoDescription: string | null }[];
}
