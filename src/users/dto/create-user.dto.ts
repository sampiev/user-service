import { IsString, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    surname: string;

    @IsEmail()
    email: string;

    @IsPhoneNumber(null)
    phone: string;

    @IsString()
    password: string;

    @IsString()
    regStatus: 'started';


}
