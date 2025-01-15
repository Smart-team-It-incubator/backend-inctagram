import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsOptional } from "class-validator";

export class PublicUserProfileDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '1990-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  dateOfBirthday?: Date;

  constructor(
    id: string,
    email: string,
    username: string,
    firstName?: string,
    lastName?: string,
    city?: string,
    country?: string,
    dateOfBirthday?: Date
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.firstName = firstName || null;
    this.lastName = lastName || null;
    this.city = city || null;
    this.country = country || null;
    this.dateOfBirthday = dateOfBirthday || null;
  }
}
