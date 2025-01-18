import { IsPhoneNumber } from 'class-validator';

export class CompletePhoneDto {
    @IsPhoneNumber()
    phone: string;
}