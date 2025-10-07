import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController, CalendarController } from './bookings.controller';

@Module({
  controllers: [BookingsController, CalendarController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
