import { IsEmail, IsString, MinLength, IsOptional, MaxLength, Matches, Max } from "@nestjs/class-validator";

const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{6,}$/;


export class CreateUserDto {
  @IsEmail()
  email: string;


  @Matches(passwordRegExp, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password: string;

  @IsString()
  @MinLength(6, { message: 'Username must be at least 6 characters long' })
  @MaxLength(30, { message: 'Username must be at most 30 characters long' })
  username: string;

  @IsString()
  @MinLength(3, { message: 'FirstName must be at least 3 characters long' })
  @MaxLength(30, { message: 'FirstName must be at most 30 characters long' })
  firstName: string;

  @IsString()
  @MinLength(3, { message: 'LastName must be at least 3 characters long' })
  @MaxLength(30, { message: 'LastName must be at most 30 characters long' })
  lastName?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}