
import { IsString, IsOptional } from 'class-validator';

export class CompleteRegistrationDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}