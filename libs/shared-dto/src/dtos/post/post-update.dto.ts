import { IsString, IsOptional, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdatePostDto {
    @ApiProperty({
      description: 'Text content of the post',
      example: 'This is a sample post text',
    })
    @Transform(({ value }) => value.trim().replace(/\s+/g, ' ')) // Убираем лишние пробелы
    @MinLength(10, { message: 'Text must be at least 10 characters long' })
    @MaxLength(500, { message: 'Text must not exceed 500 characters' })
    @IsString()
    text: string;
  }
