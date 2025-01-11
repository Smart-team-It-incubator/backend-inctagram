import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'GitHub Provider ID', required: false })
  @IsOptional()
  @IsString()
  githubId?: string;

  @ApiProperty({ description: 'User email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Username', required: false })
  @IsOptional()
  @IsString()
  username?: string;


  @ApiProperty({ description: 'isEmailConfirmed', required: false })
  @IsOptional()
  isEmailConfirmed?: boolean;
  // Добавляйте только те поля, которые можно обновить
}