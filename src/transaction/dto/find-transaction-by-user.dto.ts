import { IsDate, IsMongoId, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FindTransactionByUserDto {
  @IsMongoId()
  userId: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;
}
