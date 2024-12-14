import { ValidationPipe, ValidationError } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new HttpException(
          { message: 'Validation failed', errors: formattedErrors },
          HttpStatus.BAD_REQUEST,
        );
      },
    });
  }
}