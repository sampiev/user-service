import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @IsNotEmpty()
    @IsString()
    @Length(4, 4) // Код должен быть длиной 4 символа
    verification_code: string;
}