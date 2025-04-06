import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import {AuthenticatorTransportFuture} from "@simplewebauthn/server";

export type PasskeyDocument = HydratedDocument<Passkey>;

@Schema()
export class Passkey {
  @Prop()
  backedUp: boolean;

  @Prop()
  deviceType: string;

  @Prop()
  transports: AuthenticatorTransportFuture[] | undefined;

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
