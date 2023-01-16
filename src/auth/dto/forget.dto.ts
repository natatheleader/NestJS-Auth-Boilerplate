import { IsEmail, IsNotEmpty } from "class-validator"

export class ForgetDto {
    @IsEmail()
    @IsNotEmpty()
    email:          string
}