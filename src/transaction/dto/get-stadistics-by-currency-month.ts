import { IsMongoId, IsString } from 'class-validator';

export class GetStatisticsByCurrencyMonthDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  currencyId: string;

  @IsString()
  categoryType: string;
}
