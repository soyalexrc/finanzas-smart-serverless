import { IsString, IsEmail, IsUrl, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsUrl()
  photoUrl: string;

  @IsArray()
  @IsOptional()
  favCurrencies?: string[];
}
