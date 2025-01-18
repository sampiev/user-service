import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifySmsDto {

    @IsPhoneNumber()
    phone: string;

    @IsString()
    @Length(6, 6) // Длина кода должна быть 6 символов
    code: string;
}