import { IUserInterface } from "apps/core_app/src/application/services/user/user-interface";

export class UserViewModel implements IUserInterface {
    id: string;
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(private user: IUserInterface) {}
  
    getPublicProfile() {
      return {
        id: this.user.id,
        email: this.user.email,
        login: this.user.username,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
      };
    }
  }