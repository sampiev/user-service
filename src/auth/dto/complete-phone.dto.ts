import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CompletePhoneDto {
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber(null, { message: 'Invalid phone number format' })
    phone_number: string;
}
