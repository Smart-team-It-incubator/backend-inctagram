import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEmail, IsString, IsOptional } from "class-validator";

export class PublicUserProfileDto {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @Expose()
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  username: string;

  @Expose()
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Expose()
  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Expose()
  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @Expose()
  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @Expose()
  @ApiProperty({ example: '1990-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  dateOfBirthday?: Date;

  @Expose()
  @ApiProperty({ example: 'https://example.url', required: false })
  @IsOptional()
  profileImageUrl?: string;

  constructor(
    id: string,
    email: string,
    username: string,
    firstName?: string,
    lastName?: string,
    city?: string,
    country?: string,
    dateOfBirthday?: Date,
    profileImageUrl?: string
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.firstName = firstName || null;
    this.lastName = lastName || null;
    this.city = city || null;
    this.country = country || null;
    this.dateOfBirthday = dateOfBirthday || null;
    this.profileImageUrl = profileImageUrl || null;
  }
}
