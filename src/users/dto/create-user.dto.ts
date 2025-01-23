import { IsString, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {


    @IsPhoneNumber(null)
    phone_number: string;


}
