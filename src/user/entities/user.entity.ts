import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {IsOptional} from "class-validator";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: false })
  @IsOptional()
  firstname: string;

  @Prop({ required: false })
  @IsOptional()
  lastname: string;

  @Prop({ required: false })
  @IsOptional()
  challenge: string;

  @Prop({ required: false })
  @IsOptional()
  credentialID: string;

  @Prop({ required: false })
  @IsOptional()
  publicKey: string;

  @Prop({ required: false })
  @IsOptional()
  phone?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  @IsOptional()
  password: string;

  @Prop({ required: false })
  @IsOptional()
  pushToken?: string;

  @Prop()
  favCurrencies?: string[];

  @Prop()
  photoUrl?: string;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
  // organization: Organization;
}

export const UserSchema = SchemaFactory.createForClass(User);
