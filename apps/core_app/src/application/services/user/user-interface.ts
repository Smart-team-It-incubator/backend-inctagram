export interface IUserInterface {
    id: string;
    email: string;
    password: string;
    username: string;
    role: string;
    isEmailConfirmed: boolean;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    emailConfirmationCode?: string;
    emailConfirmationCodeExpirationDate?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    city: string;
    country: string;
    dateOfBirthday: Date;
    githubPrividers?: string;
  }