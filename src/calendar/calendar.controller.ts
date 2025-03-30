import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar.-event.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Auth()
@Controller('calendar-events')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createCalendarDto: CreateCalendarEventDto) {
    return this.calendarService.create(createCalendarDto);
  }

  @Get('getEventsForDateRange')
  async getEventsForDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId: string,
  ) {
    return this.calendarService.getEventsForDateRange(
      startDate,
      endDate,
      userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(+id);
  }

  @Patch(':eventId/occurrences/:date')
  async updateCheckedStatus(
    @Param('eventId') eventId: string,
    @Param('date') date: string,
    @Body('checked') checked: boolean,
  ) {
    return this.calendarService.updateCheckedStatus(eventId, date, checked);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarService.remove(+id);
  }
}
