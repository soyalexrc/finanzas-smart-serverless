import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/entities/user.entity';

export type PasskeyDocument = HydratedDocument<Passkey>;

@Schema()
export class Passkey {
  @Prop()
  backedUp: boolean;

  @Prop()
  deviceType: string;

  @Prop()
  transports: any;

  @Prop()
  counter: number;

  @Prop()
  publicKey: string;

  @Prop()
  credentialId: string;

  @Prop()
  webAuthnUserID: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const PasskeySchema = SchemaFactory.createForClass(Passkey);
