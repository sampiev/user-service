import { IsNotEmpty, IsPhoneNumber, Matches } from 'class-validator';

export class CompletePhoneDto {
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber(null, { message: 'Invalid phone number format' })
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message:
            'Phone number must be in E.164 format, starting with a "+" followed by 9-15 digits.',
    })
    phone_number: string;
}
