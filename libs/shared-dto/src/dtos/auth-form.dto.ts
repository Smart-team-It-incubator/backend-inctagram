import { MinLength, MaxLength, Matches, IsEmail,} from "class-validator";

const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{6,}$/;
const usernameRegExp = /^[A-Za-z0-9_-]+$/;


export class AuthForm {
    @IsEmail()
    email: string;
    @MinLength(6)
    @MaxLength(20)
    @Matches(passwordRegExp)
    password: string;
}
