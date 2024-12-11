export class User {
    constructor(
      public id: string,
      public email: string,
      public passwordHash: string,
      public login: string,
      public role: string = 'user',
      public isEmailVerified: boolean = false,
      public firstName: string,
      public lastName: string,
      public profileImageUrl?: string,
      public emailVerificationToken?: string,
      public resetPasswordToken?: string,
      public resetPasswordExpires?: Date,
      public lastLogin?: Date,
      public createdAt: Date = new Date(),
      public updatedAt: Date = new Date(),
    ) {}
  

    // Эти методы пока непонятно как использовать, далее разберемся!
    verifyEmail(): void {
      this.isEmailVerified = true;
    }
  
    updatePassword(newPasswordHash: string): void {
      this.passwordHash = newPasswordHash;
      this.updatedAt = new Date();
    }
  }