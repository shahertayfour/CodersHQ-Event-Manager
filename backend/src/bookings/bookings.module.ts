import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController, CalendarController } from './bookings.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [BookingsController, CalendarController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
