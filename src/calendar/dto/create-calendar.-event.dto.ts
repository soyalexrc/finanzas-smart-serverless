import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  ValidateNested,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class OccurrenceDto {
  @IsDateString()
  date: string;

  @IsOptional()
  checked?: boolean;

  @IsNotEmpty()
  @IsString()
  color: string; // Color per occurrence
}

export class CreateCalendarEventDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  title: string;

  @IsEnum(['income', 'expense'])
  category: 'income' | 'expense';

  @IsDateString()
  startDate: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  recurrence: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  weeksCount?: number;

  @IsOptional()
  @IsNumber()
  monthsCount?: number;

  @IsOptional()
  @IsNumber()
  yearsCount?: number;

  @IsOptional()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OccurrenceDto)
  occurrences?: OccurrenceDto[];
}
