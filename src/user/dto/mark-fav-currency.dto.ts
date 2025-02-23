import { IsString, IsMongoId } from 'class-validator';

export class MarkFavCurrencyDto {
  @IsString()
  @IsMongoId()
  userId: string;

  @IsString()
  @IsMongoId()
  currencyId: string;
}
