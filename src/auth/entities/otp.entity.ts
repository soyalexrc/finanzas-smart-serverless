import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/entities/user.entity';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true }) // añade createdAt y updatedAt automáticamente
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  code: string;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  user?: User;

  @Prop({ default: Date.now, expires: 300 }) // 5 minutos de validez
  createdAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
