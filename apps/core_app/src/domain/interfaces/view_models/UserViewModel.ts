import { IUserInterface } from "@core_app/src/application/services/user/user-interface";
import { ApiProperty } from "@nestjs/swagger";

export class UserViewModel implements IUserInterface {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
    isEmailConfirmed: boolean;
    emailConfirmationCode?: string;
    emailConfirmationCodeExpirationDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    city: string;
    country: string;
    dateOfBirthday: Date
    githubId: string
    constructor(private user: IUserInterface) {}
  
    getPublicProfile() {
      return {
        id: this.user.id,
        email: this.user.email,
        username: this.user.username,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        city: this.user.city,
        country: this.user.country,
        dateOfBirthday: this.user.dateOfBirthday
      };
    }
    getPrivateProfile() {
      return {
        id: this.user.id,
        email: this.user.email,
        username: this.user.username,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        city: this.user.city,
        country: this.user.country,
        dateOfBirthday: this.user.dateOfBirthday,
        password: this.user.password,
        role: this.user.role,
        emailConfirmationCode: this.user.emailConfirmationCode,
        emailConfirmationCodeExpirationDate: this.user.emailConfirmationCodeExpirationDate,
        isEmailConfirmed: this.user.isEmailConfirmed,
        githubId: this.githubId
      };
    }
  }