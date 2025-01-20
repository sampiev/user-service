import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SendCodeDto {
    @IsNotEmpty()
    @IsPhoneNumber(null, { message: 'Invalid phone number format' }) // Проверка на корректный номер телефона
    phone: string;
}
