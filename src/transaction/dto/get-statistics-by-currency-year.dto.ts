import { IsMongoId, IsNumber } from 'class-validator';

export class GetStatisticsByCurrencyYearDto {
  @IsMongoId()
  userId: string;

  @IsNumber()
  year: number;

  @IsMongoId()
  currency: string;
}
