import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role, BookingStatus } from '@prisma/client';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateInternalEventDto } from './dto/create-internal-event.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('bookings')
  getAllBookings(
    @Query('status') status?: BookingStatus,
    @Query('spaceId') spaceId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('requesterName') requesterName?: string,
  ) {
    return this.adminService.getAllBookings(
      status,
      spaceId,
      from,
      to,
      requesterName,
    );
  }

  @Get('bookings/:id')
  getBookingById(@Param('id') id: string) {
    return this.adminService.getBookingById(id);
  }

  @Patch('bookings/:id/approve')
  approveBooking(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.approveBooking(id, user.id, dto);
  }

  @Patch('bookings/:id/deny')
  denyBooking(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.denyBooking(id, user.id, dto);
  }

  @Patch('bookings/:id/request-edit')
  requestEdit(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.requestEdit(id, user.id, dto);
  }

  @Post('events')
  createInternalEvent(
    @CurrentUser() user: any,
    @Body() dto: CreateInternalEventDto,
  ) {
    return this.adminService.createInternalEvent(user.id, dto);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.deleteEvent(id, user.id);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getAllUsers(
    @Query('role') role?: Role,
    @Query('emailVerified') emailVerified?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(role, emailVerified, search);
  }
}
