import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsMongoId,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DocumentDto {
  @IsString()
  url: string;

  @IsString()
  title: string;
}

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsMongoId()
  category: string;

  @IsMongoId()
  currency: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsMongoId()
  user: string;
}
