export class JwtPayload {
    userId: string;
    username: string;
    role: string;
    iat: number;
    exp: number;
  

    constructor(data: Partial<JwtPayload>) {
      Object.assign(this, data);
    }
    get expirationDate(): Date {
      return new Date(this.exp * 1000);
    }
  }