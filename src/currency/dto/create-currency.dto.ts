import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @Length(3, 3, { message: 'Code must be exactly 3 characters' })
  code: string;

  @IsString()
  @Length(1, 5, { message: 'Symbol must be between 1 and 5 characters' })
  symbol: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(6, { message: 'Decimals must be between 0 and 6' })
  decimals: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'ISO number must be exactly 3 digits' })
  isoNumber?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  subunit?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  subunitToUnit?: number;
}
