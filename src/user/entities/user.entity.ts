import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop()
  phone?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  photoUrl?: string;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
  // organization: Organization;
}

export const UserSchema = SchemaFactory.createForClass(User);
