import { IUserInterface } from "@core_app/src/application/services/user/user-interface";

export class UserViewModel implements IUserInterface {
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
    githubPrividers: string
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
        githubPrividers: this.githubPrividers

      };
    }
  }