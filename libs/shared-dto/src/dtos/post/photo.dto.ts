import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, MaxLength } from "class-validator";

export class PhotoDto {
  @ApiProperty({
    description: 'URL of the uploaded photo after processing.',
    example: 'https://example.com/uploads/photo-12345.jpeg', // Пример ссылки на фото
  })
  @IsString()
  photoUrl: string;

  @ApiProperty({
    description: 'Description for the photo.',
    example: 'A beautiful sunset.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description: string;
}
