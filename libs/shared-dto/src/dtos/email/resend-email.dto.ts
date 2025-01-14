import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendConfirmationCodeDto {
    @ApiProperty({
        description: 'Email of the user requesting the confirmation code.',
        example: 'user@example.com', // Пример значения
        required: true, // Поле обязательно
    })
    @IsEmail({}, { message: 'Invalid email format' }) // Проверка формата email
    @IsNotEmpty({ message: 'Email is required' }) // Проверка, что поле не пустое
    email: string;
}