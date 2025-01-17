import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, MaxLength } from "class-validator";

export class PhotoDto {
  @ApiProperty({
    description: 'Base64-encoded photo content',
    example: 'data:image/jpeg;base64,...',
  })
  @IsString()
  photoUrl: string;

  @ApiProperty({
    description: 'Description for the photo',
    example: 'A beautiful sunset.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description: string;
}