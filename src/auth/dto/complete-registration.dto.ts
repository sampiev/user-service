import { IsPhoneNumber, IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

export class CompleteRegistrationDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @IsOptional()
    surname?: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}
