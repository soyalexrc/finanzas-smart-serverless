import { IsString, IsEmail, IsUrl, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsString()
  @IsOptional()
  challenge: string;

  @IsString()
  @IsOptional()
  credentialID: string;

  @IsString()
  @IsOptional()
  publicKey: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsUrl()
  @IsOptional()
  photoUrl: string;

  @IsArray()
  @IsOptional()
  favCurrencies?: string[];
}
