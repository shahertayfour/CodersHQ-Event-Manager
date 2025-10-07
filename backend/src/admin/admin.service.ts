import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Visibility, Seating } from '@prisma/client';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateInternalEventDto } from './dto/create-internal-event.dto';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private bookingsService: BookingsService,
  ) {}

  async getAllBookings(
    status?: BookingStatus,
    spaceId?: string,
    from?: string,
    to?: string,
    requesterName?: string,
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (spaceId) {
      where.spaceId = spaceId;
    }

    if (from && to) {
      where.startDate = { gte: new Date(from) };
      where.endDate = { lte: new Date(to) };
    }

    if (requesterName) {
      where.OR = [
        { firstName: { contains: requesterName, mode: 'insensitive' } },
        { lastName: { contains: requesterName, mode: 'insensitive' } },
      ];
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        space: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        space: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            entity: true,
            jobTitle: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async approveBooking(id: string, adminId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.getBookingById(id);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.APPROVED,
        adminComment: dto.adminComment,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        space: true,
        requester: true,
      },
    });

    // TODO: Send email notification to user
    return updated;
  }

  async denyBooking(id: string, adminId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.getBookingById(id);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.DENIED,
        adminComment: dto.adminComment,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        space: true,
        requester: true,
      },
    });

    // TODO: Send email notification to user
    return updated;
  }

  async requestEdit(id: string, adminId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.getBookingById(id);

    if (!dto.adminComment) {
      throw new Error('Admin comment is required when requesting edits');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.EDIT_REQUESTED,
        adminComment: dto.adminComment,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        space: true,
        requester: true,
      },
    });

    // TODO: Send email notification to user
    return updated;
  }

  async createInternalEvent(adminId: string, dto: CreateInternalEventDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Check for overlapping bookings
    await this.bookingsService.checkOverlap(dto.spaceId, startDate, endDate);

    // Get admin user for requester info
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const event = await this.prisma.booking.create({
      data: {
        requesterId: adminId,
        firstName: admin.firstName || 'CHQ',
        lastName: admin.lastName || 'Admin',
        email: admin.email,
        phoneNumber: admin.phoneNumber || 'N/A',
        entity: 'Coders HQ',
        jobTitle: 'Administrator',
        spaceId: dto.spaceId,
        eventName: dto.eventName,
        startDate,
        endDate,
        attendees: 1,
        seating: Seating.THEATRE,
        agenda: dto.description || 'Internal event',
        valet: false,
        catering: false,
        photography: false,
        itSupport: false,
        screensDisplay: false,
        visibility: dto.visibility || Visibility.INTERNAL,
        status: BookingStatus.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        space: true,
      },
    });

    return event;
  }

  async deleteEvent(id: string, adminId: string) {
    const booking = await this.getBookingById(id);

    await this.prisma.booking.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async getStats() {
    const [totalBookings, pendingBookings, approvedBookings, deniedBookings] =
      await Promise.all([
        this.prisma.booking.count(),
        this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
        this.prisma.booking.count({ where: { status: BookingStatus.APPROVED } }),
        this.prisma.booking.count({ where: { status: BookingStatus.DENIED } }),
      ]);

    const spaceUtilization = await this.prisma.booking.groupBy({
      by: ['spaceId'],
      where: { status: BookingStatus.APPROVED },
      _count: true,
    });

    return {
      totalBookings,
      pendingBookings,
      approvedBookings,
      deniedBookings,
      spaceUtilization,
    };
  }
}
