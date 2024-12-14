export interface IUserInterface {
    id: string;
    email: string;
    password: string;
    username: string;
    role: string;
    isEmailVerified: boolean;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    emailVerificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    city: string;
    country: string;
    dateOfBirthday: Date
  }