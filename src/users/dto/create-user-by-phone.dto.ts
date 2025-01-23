import { IsString, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateUserByPhoneDto {


    @IsPhoneNumber(null)
    phone_number: string;

}