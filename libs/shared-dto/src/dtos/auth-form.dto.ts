import { MinLength, MaxLength, Matches,} from "class-validator";

const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{6,}$/;
const usernameRegExp = /^[A-Za-z0-9_-]+$/;


export class AuthForm {
    @MinLength(3)
    @MaxLength(10)
    @Matches(usernameRegExp)
    username: string;
    @MinLength(6)
    @MaxLength(20)
    @Matches(passwordRegExp)
    password: string;
}
