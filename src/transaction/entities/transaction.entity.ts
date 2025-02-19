import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import {Category} from "../../category/entities/category.entity";
import {Currency} from "../../currency/entities/currency.entity";

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({
  timestamps: true,
})
export class Transaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Category;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Currency' })
  currency: Currency;

  @Prop({ required: true })
  date: Date;

  @Prop()
  description?: string;

  @Prop()
  title?: string;

  @Prop({ type: [{ url: String, title: String }] })
  documents?: { url: string; title: string }[];

  @Prop()
  images?: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
