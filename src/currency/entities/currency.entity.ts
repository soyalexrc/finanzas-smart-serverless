import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CurrencyDocument = HydratedDocument<Currency>;

@Schema()
export class Currency {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  decimals: number;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  isoNumber: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  subunit: string;

  @Prop({ required: true })
  subunitToUnit: number;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
