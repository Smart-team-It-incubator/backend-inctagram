import { IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  userId: string;
}