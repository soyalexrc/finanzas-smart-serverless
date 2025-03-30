import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CalendarEventDocument = CalendarEvent & Document;

@Schema()
export class CalendarEvent {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  category: 'income' | 'expense';

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  recurrence: string;

  @Prop()
  endDate?: Date; // For daily recurrence

  @Prop()
  weeksCount?: number; // For weekly recurrence

  @Prop()
  monthsCount?: number; // For monthly recurrence

  @Prop()
  yearsCount?: number; // For yearly recurrence

  @Prop({
    type: [
      {
        date: { type: Date, required: true },
        checked: { type: Boolean, default: false },
        color: { type: String, required: true },
      },
    ],
    default: [],
  })
  occurrences: { date: Date; checked: boolean }[];
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
