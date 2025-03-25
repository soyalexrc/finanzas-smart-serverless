import { IsEmail, IsArray, ArrayNotEmpty } from 'class-validator';

export class CheckUsersByEmailDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true }) // Ensures each element in the array is a valid email
  emails: string[];
}
