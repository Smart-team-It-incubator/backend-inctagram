import { ApiProperty } from "@nestjs/swagger";
import { MinLength, MaxLength, Matches, IsEmail, ValidateIf,} from "class-validator";

const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{6,}$/;
const usernameRegExp = /^[A-Za-z0-9_-]+$/;


export class AuthForm {
    @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
    @IsEmail()
    email: string;
    
    @ValidateIf((o) => !o.githubId)  // Валидация пароля только если githubId отсутствует
    @ApiProperty({ description: 'Пароль пользователя', example: 'passworD1!' })
    @MinLength(6)
    @MaxLength(20)
    @Matches(passwordRegExp)
    password: string;

    githubId?: string
}
