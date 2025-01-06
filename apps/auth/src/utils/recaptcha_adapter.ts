import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecaptchaAdapter {
  private readonly recaptchaSecretKey: string;
  private readonly recaptchaVerifyUrl: string = 'https://www.google.com/recaptcha/api/siteverify';

  constructor(private readonly configService: ConfigService) {
    this.recaptchaSecretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');

    if (!this.recaptchaSecretKey) {
      throw new Error('RECAPTCHA_SECRET_KEY is not set in the environment variables.');
    }
  }

  /**
   * Validates the reCAPTCHA token with Google API
   * @param token - The reCAPTCHA token provided by the client
   * @param remoteIp - The IP address of the client (optional)
   * @returns Promise<boolean>
   */
  async validateToken(token: string, remoteIp?: string): Promise<boolean> {
    if (!token) {
      throw new HttpException('Missing reCAPTCHA token', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await axios.post(
        this.recaptchaVerifyUrl,
        new URLSearchParams({
          secret: this.recaptchaSecretKey,
          response: token,
          remoteip: remoteIp || '',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { success, 'error-codes': errorCodes } = response.data;

      if (!success) {
        console.error('reCAPTCHA validation failed:', errorCodes);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating reCAPTCHA:', error.message);
      throw new HttpException('Failed to validate reCAPTCHA', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
