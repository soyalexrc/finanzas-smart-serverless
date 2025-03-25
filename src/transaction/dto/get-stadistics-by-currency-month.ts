import { IsMongoId } from 'class-validator';

export class GetStatisticsByCurrencyMonthDto {
  @IsMongoId()
  userId: string;
}
