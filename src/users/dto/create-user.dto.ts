import { IsString, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    surname: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsPhoneNumber(null)
    @IsOptional()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
