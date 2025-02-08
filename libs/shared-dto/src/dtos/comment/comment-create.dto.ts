import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CommentCreatePayload {
      @ApiProperty({
        description: 'Text content of the comment',
        example: 'This is a sample comment text',
      })
      @IsString()
    text: string;
}