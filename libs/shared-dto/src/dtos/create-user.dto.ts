import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, Matches, IsString, MinLength, MaxLength, IsOptional, IsDateString, ValidateIf } from "class-validator";

const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{6,}$/;
const usernameRegExp = /^[A-Za-z0-9_-]+$/;

export class CreateUserDto {
  @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя. Должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.',
    example: 'P@ssw0rd!',
  })
  @ValidateIf((o) => !o.githubId)  // Валидация пароля только если githubId отсутствует
  @Matches(passwordRegExp, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password?: string;

  @ApiProperty({
    description: 'Имя пользователя. Может содержать только буквы, цифры, подчеркивания (_) и дефисы (-).',
    example: 'user_name123',
  })
  @ValidateIf((o) => !o.githubId)  // Валидация username только если githubId отсутствует
  @Matches(usernameRegExp, {
    message:
      'Username must contain only alphanumeric characters, underscores (_), and hyphens (-). It should not contain any spaces or special characters.',
  })
  @IsString()
  @MinLength(6, { message: 'Username must be at least 6 characters long' })
  @MaxLength(30, { message: 'Username must be at most 30 characters long' })
  username?: string;

  @ApiPropertyOptional({
    description: 'Имя пользователя.',
    example: 'John',
  })
  @ValidateIf((o) => !o.githubId)  // Валидация FirstName только если githubId отсутствует
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'FirstName must be at least 3 characters long' })
  @MaxLength(30, { message: 'FirstName must be at most 30 characters long' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Фамилия пользователя.',
    example: 'Doe',
  })
  @ValidateIf((o) => !o.githubId)  // Валидация LastName только если githubId отсутствует
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'LastName must be at least 3 characters long' })
  @MaxLength(30, { message: 'LastName must be at most 30 characters long' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Страна пользователя.',
    example: 'USA',
  })
  @ValidateIf((o) => !o.githubId)  // Валидация country только если githubId отсутствует
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Город пользователя.',
    example: 'New York',
  })
  @ValidateIf((o) => !o.githubId)  // Валидация city только если githubId отсутствует
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Дата рождения пользователя в формате ISO.',
    example: '2000-01-01',
  })
  @ValidateIf((o) => !o.githubId)  // Валидация dateOfBirthday только если githubId отсутствует
  @IsOptional()
  @IsDateString()
  dateOfBirthday?: Date;

  @ApiPropertyOptional({
    description: 'URL изображения профиля пользователя.',
    example: 'https://example.com/profile-image.jpg',
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Код подтверждения email.',
    example: '123456',
  })
  @IsOptional()
  emailConfirmationCode?: string;

  @ApiPropertyOptional({
    description: 'Дата истечения срока действия кода подтверждения email.',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  emailConfirmationCodeExpirationDate?: Date;

  @ApiPropertyOptional({
    description: 'ID пользователя в GitHub.',
    example: '1234567890',
  })
  @IsOptional()  // Не обязательно для GitHub авторизации
  githubId?: string;
}
