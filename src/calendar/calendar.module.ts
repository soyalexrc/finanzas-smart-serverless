import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencySchema } from '../currency/entities/currency.entity';
import { CalendarEventSchema } from './entities/calendar-event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CalendarEvent', schema: CalendarEventSchema },
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
