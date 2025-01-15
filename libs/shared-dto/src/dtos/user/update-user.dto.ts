import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsBoolean, IsDateString, Matches, MaxLength, MinLength } from 'class-validator';


const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{6,}$/;

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  githubId?: string;

  @ApiProperty({ description: 'User email', required: false, type: String })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Username', required: false, type: String })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Indicates if the email is confirmed', required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isEmailConfirmed?: boolean;

  @ApiProperty({ description: 'Token for password reset', required: false, type: String })
  @IsOptional()
  @IsString()
  resetPasswordToken?: string;

  @IsOptional()
  @IsDateString()
  resetPasswordExpires?: Date;


  @ApiProperty({ description: 'Password', required: false, type: String })
  @IsOptional()
  @Matches(passwordRegExp, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
  })
  // Тут мы не проверяем длину пароля т.к нам приходит уже Хэш и он длинее 20 символов
  @IsString()
  password?: string;
}
