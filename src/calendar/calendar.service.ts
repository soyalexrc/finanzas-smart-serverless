import { Injectable } from '@nestjs/common';
import { CreateCalendarEventDto } from './dto/create-calendar.-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalendarEvent } from './entities/calendar-event.entity';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  isBefore,
  isWithinInterval,
  parseISO,
} from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel('CalendarEvent')
    private readonly calendarEventModel: Model<CalendarEvent>,
  ) {}

  async create(data: CreateCalendarEventDto) {
    const occurrences = this.generateOccurrences(data);
    const event = await this.calendarEventModel.create({
      ...data,
      occurrences,
    });
    return event;
  }
  async getEventsForDateRange(
    startDate: string,
    endDate: string,
    userId: string,
  ) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Fetch all events that belong to the user and have occurrences in the range
    const events = await this.calendarEventModel.find({
      userId, // Ensure events belong to the specific user
      'occurrences.date': { $gte: start, $lte: end },
    });

    // Filter occurrences based on the given date range
    return events.map((event) => ({
      ...event.toObject(),
      occurrences: event.occurrences.filter((occurrence) =>
        isWithinInterval(parseISO(occurrence.date.toISOString()), {
          start,
          end,
        }),
      ),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} calendar`;
  }

  async updateCheckedStatus(eventId: string, date: string, checked: boolean) {
    return this.calendarEventModel.findOneAndUpdate(
      { _id: eventId, 'occurrences.date': new Date(date) },
      { $set: { 'occurrences.$.checked': checked } },
      { new: true },
    );
  }

  private generateOccurrences(event: CreateCalendarEventDto) {
    const occurrences: { date: string; checked: boolean; color: string }[] = [];
    let date = parseISO(event.startDate);
    let occurrenceIndex = 0;
    const defaultColor = '#dc4c3e';

    switch (event.recurrence) {
      case 'daily':
        while (isBefore(date, parseISO(event.endDate!))) {
          occurrences.push({
            date: format(date, 'yyyy-MM-dd'),
            checked: false,
            color: event.occurrences?.[occurrenceIndex]?.color || defaultColor, // Default color if not provided
          });
          date = addDays(date, 1);
          occurrenceIndex++;
        }
        break;

      case 'weekly':
        for (let i = 0; i < event.weeksCount!; i++) {
          occurrences.push({
            date: format(date, 'yyyy-MM-dd'),
            checked: false,
            color: event.occurrences?.[occurrenceIndex]?.color || defaultColor,
          });
          date = addWeeks(date, 1);
          occurrenceIndex++;
        }
        break;

      case 'monthly':
        for (let i = 0; i < event.monthsCount!; i++) {
          occurrences.push({
            date: format(date, 'yyyy-MM-dd'),
            checked: false,
            color: event.occurrences?.[occurrenceIndex]?.color || defaultColor,
          });
          date = addMonths(date, 1);
          occurrenceIndex++;
        }
        break;

      case 'yearly':
        for (let i = 0; i < event.yearsCount!; i++) {
          occurrences.push({
            date: format(date, 'yyyy-MM-dd'),
            checked: false,
            color: event.occurrences?.[occurrenceIndex]?.color || defaultColor,
          });
          date = addYears(date, 1);
          occurrenceIndex++;
        }
        break;
    }

    return occurrences;
  }

  remove(id: number) {
    return `This action removes a #${id} calendar`;
  }
}
