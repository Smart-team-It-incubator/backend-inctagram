import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Matches, IsString, MinLength, MaxLength, IsOptional, IsDateString, ValidateIf } from "class-validator";

const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{6,}$/;
const usernameRegExp = /^[A-Za-z0-9_-]+$/;

export class CreateUserDto {
  @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ValidateIf((o) => !o.githubId)  // Валидация пароля только если githubId отсутствует
  @Matches(passwordRegExp, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password?: string;

  @ValidateIf((o) => !o.githubId)  // Валидация username только если githubId отсутствует
  @Matches(usernameRegExp, {
    message:
      'Username must contain only alphanumeric characters, underscores (_), and hyphens (-). It should not contain any spaces or special characters.',
  })
  @IsString()
  @MinLength(6, { message: 'Username must be at least 6 characters long' })
  @MaxLength(30, { message: 'Username must be at most 30 characters long' })
  username?: string;

  @ValidateIf((o) => !o.githubId)  // Валидация FirstName только если githubId отсутствует
  @IsString()
  @MinLength(3, { message: 'FirstName must be at least 3 characters long' })
  @MaxLength(30, { message: 'FirstName must be at most 30 characters long' })
  firstName?: string;

  @ValidateIf((o) => !o.githubId)  // Валидация LastName только если githubId отсутствует
  @IsString()
  @MinLength(3, { message: 'LastName must be at least 3 characters long' })
  @MaxLength(30, { message: 'LastName must be at most 30 characters long' })
  lastName?: string;
  
  @ValidateIf((o) => !o.githubId)  // Валидация country только если githubId отсутствует
  @ApiProperty({ description: 'Страна пользователя', example: 'USA' })
  @IsString()
  country?: string;

  @ValidateIf((o) => !o.githubId)  // Валидация city только если githubId отсутствует
  @ApiProperty({ description: 'Город пользователя', example: 'New York' })
  @IsString()
  city?: string;

  @ValidateIf((o) => !o.githubId)  // Валидация dateOfBirthday только если githubId отсутствует
  @ApiProperty({ description: 'Дата рождения пользователя', example: '2000-01-01' })
  @IsDateString()
  dateOfBirthday?: Date; // ISO string, e.g., '2000-01-01'

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsOptional()
  emailConfirmationCode?: string;

  @IsOptional()
  emailConfirmationCodeExpirationDate?: Date;

  @IsOptional()  // Не обязательно для GitHub авторизации
  githubId?: string;
}
