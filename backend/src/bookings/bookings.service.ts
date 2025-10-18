import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus, Visibility, Role } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const startDate = new Date(createBookingDto.startDate);
    const endDate = new Date(createBookingDto.endDate);

    // Validate dates
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Check for overlapping bookings
    await this.checkOverlap(createBookingDto.spaceId, startDate, endDate);

    // Verify space exists
    const space = await this.prisma.space.findUnique({
      where: { id: createBookingDto.spaceId },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    // Check capacity
    if (createBookingDto.attendees > space.capacity) {
      throw new BadRequestException(
        `Number of attendees (${createBookingDto.attendees}) exceeds space capacity (${space.capacity})`,
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        requesterId: userId,
        firstName: createBookingDto.firstName,
        lastName: createBookingDto.lastName,
        email: createBookingDto.email,
        phoneNumber: createBookingDto.phoneNumber,
        entity: createBookingDto.entity,
        jobTitle: createBookingDto.jobTitle,
        spaceId: createBookingDto.spaceId,
        eventName: createBookingDto.eventName,
        startDate,
        endDate,
        attendees: createBookingDto.attendees,
        seating: createBookingDto.seating,
        agenda: createBookingDto.agenda,
        valet: createBookingDto.valet || false,
        catering: createBookingDto.catering || false,
        photography: createBookingDto.photography || false,
        itSupport: createBookingDto.itSupport || false,
        screensDisplay: createBookingDto.screensDisplay || false,
        comments: createBookingDto.comments,
        visibility: createBookingDto.visibility || Visibility.PUBLIC,
      },
      include: {
        space: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send confirmation email to user
    await this.emailService.sendBookingReceivedEmail(booking);

    // Send notification to admins
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { email: true },
    });
    const adminEmails = admins.map((admin) => admin.email);
    if (adminEmails.length > 0) {
      await this.emailService.sendNewBookingNotificationToAdmins(
        booking,
        adminEmails,
      );
    }

    return booking;
  }

  async checkOverlap(
    spaceId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
  ) {
    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        spaceId,
        status: BookingStatus.APPROVED,
        AND: [
          {
            startDate: {
              lt: endDate,
            },
          },
          {
            endDate: {
              gt: startDate,
            },
          },
        ],
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
      },
    });

    if (overlappingBookings.length > 0) {
      throw new ConflictException(
        'This time slot is already booked for the selected space',
      );
    }
  }

  async findUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { requesterId: userId },
      include: {
        space: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
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
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Users can only see their own bookings unless admin
    if (userId && booking.requesterId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getCalendar(spaceId?: string, from?: string, to?: string) {
    const where: any = {
      status: BookingStatus.APPROVED,
    };

    if (spaceId) {
      where.spaceId = spaceId;
    }

    if (from && to) {
      where.startDate = { gte: new Date(from) };
      where.endDate = { lte: new Date(to) };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        space: true,
      },
      orderBy: { startDate: 'asc' },
    });

    // Map to calendar format, hiding private booking details
    return bookings.map((booking) => {
      if (booking.visibility === Visibility.PRIVATE) {
        return {
          id: booking.id,
          title: 'Reserved (Private)',
          start: booking.startDate,
          end: booking.endDate,
          spaceId: booking.spaceId,
          spaceName: booking.space.name,
          visibility: booking.visibility,
        };
      }

      if (booking.visibility === Visibility.INTERNAL) {
        return {
          id: booking.id,
          title: 'Internal Event',
          start: booking.startDate,
          end: booking.endDate,
          spaceId: booking.spaceId,
          spaceName: booking.space.name,
          visibility: booking.visibility,
        };
      }

      return {
        id: booking.id,
        title: booking.eventName,
        start: booking.startDate,
        end: booking.endDate,
        spaceId: booking.spaceId,
        spaceName: booking.space.name,
        entity: booking.entity,
        attendees: booking.attendees,
        visibility: booking.visibility,
      };
    });
  }

  async update(id: string, userId: string, updateBookingDto: UpdateBookingDto) {
    // Find the booking first
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check ownership
    if (booking.requesterId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    // Only allow updates if booking is PENDING or EDIT_REQUESTED
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.EDIT_REQUESTED) {
      throw new BadRequestException('Cannot update a booking that has been approved or denied');
    }

    const startDate = new Date(updateBookingDto.startDate);
    const endDate = new Date(updateBookingDto.endDate);

    // Validate dates
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Check for overlapping bookings (excluding this booking)
    await this.checkOverlap(updateBookingDto.spaceId, startDate, endDate, id);

    // Verify space exists
    const space = await this.prisma.space.findUnique({
      where: { id: updateBookingDto.spaceId },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    // Check capacity
    if (updateBookingDto.attendees > space.capacity) {
      throw new BadRequestException(
        `Number of attendees (${updateBookingDto.attendees}) exceeds space capacity (${space.capacity})`,
      );
    }

    // Update the booking and reset to PENDING status
    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        firstName: updateBookingDto.firstName,
        lastName: updateBookingDto.lastName,
        email: updateBookingDto.email,
        phoneNumber: updateBookingDto.phoneNumber,
        entity: updateBookingDto.entity,
        jobTitle: updateBookingDto.jobTitle,
        spaceId: updateBookingDto.spaceId,
        eventName: updateBookingDto.eventName,
        startDate,
        endDate,
        attendees: updateBookingDto.attendees,
        seating: updateBookingDto.seating,
        agenda: updateBookingDto.agenda,
        valet: updateBookingDto.valet || false,
        catering: updateBookingDto.catering || false,
        photography: updateBookingDto.photography || false,
        itSupport: updateBookingDto.itSupport || false,
        screensDisplay: updateBookingDto.screensDisplay || false,
        comments: updateBookingDto.comments,
        visibility: updateBookingDto.visibility || Visibility.PUBLIC,
        status: BookingStatus.PENDING, // Reset to pending after update
        adminComment: null, // Clear previous admin comment
        reviewedBy: null,
        reviewedAt: null,
      },
      include: {
        space: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send updated booking notification to admins
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { email: true },
    });
    const adminEmails = admins.map((admin) => admin.email);
    if (adminEmails.length > 0) {
      await this.emailService.sendBookingUpdatedNotification(
        updated,
        adminEmails,
      );
    }

    return updated;
  }
}
