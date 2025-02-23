import { IsDate, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindTransactionByUserDto {
  @IsMongoId()
  userId: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @IsString()
  @IsOptional()
  searchTerm?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;
}
