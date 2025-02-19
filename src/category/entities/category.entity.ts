import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/entities/user.entity';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
