export class User {
    constructor(
      public id: string,
      public email: string,
      public password: string,
      public username: string,
      public role: string = 'user',
      public isEmailVerified: boolean = false,
      public firstName: string,
      public lastName: string,
      public createdAt: Date = new Date(),
      public updatedAt: Date = new Date(),
      public city: string,
      public country: string,
      public dateOfBirthday: Date,
      public profileImageUrl?: string,
      public emailVerificationToken?: string,
      public resetPasswordToken?: string,
      public resetPasswordExpires?: Date,
      public lastLogin?: Date,
    ) {}
  

    // Эти методы пока непонятно как использовать, далее разберемся!
    // verifyEmail(): void {
    //   this.isEmailVerified = true;
    // }
  
    // updatePassword(newPasswordHash: string): void {
    //   this.password = newPasswordHash;
    //   this.updatedAt = new Date();
    // }
  }