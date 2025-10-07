import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendBookingReceivedEmail(booking: any) {
    const msg = {
      to: booking.email,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@codershq.ae',
      subject: 'Booking Received - CHQ Space Management',
      html: `
        <h2>Booking Request Received</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>Your booking request for <strong>${booking.space.name}</strong> has been received and is pending approval.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Space:</strong> ${booking.space.name}</li>
          <li><strong>Start:</strong> ${new Date(booking.startDate).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(booking.endDate).toLocaleString()}</li>
          <li><strong>Attendees:</strong> ${booking.attendees}</li>
        </ul>
        <p>You will be notified once your request is reviewed.</p>
        <p>Best regards,<br>Coders HQ Team</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendNewBookingNotificationToAdmins(booking: any, adminEmails: string[]) {
    const msg = {
      to: adminEmails,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@codershq.ae',
      subject: `New Booking Request - ${booking.space.name}`,
      html: `
        <h2>New Booking Request</h2>
        <p>A new booking request has been submitted:</p>
        <h3>Requester Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</li>
          <li><strong>Email:</strong> ${booking.email}</li>
          <li><strong>Phone:</strong> ${booking.phoneNumber}</li>
          <li><strong>Organization:</strong> ${booking.entity}</li>
        </ul>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Space:</strong> ${booking.space.name}</li>
          <li><strong>Start:</strong> ${new Date(booking.startDate).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(booking.endDate).toLocaleString()}</li>
          <li><strong>Attendees:</strong> ${booking.attendees}</li>
          <li><strong>Seating:</strong> ${booking.seating}</li>
        </ul>
        <p>Please review this request in the admin panel.</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  async sendBookingApprovedEmail(booking: any) {
    const msg = {
      to: booking.email,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@codershq.ae',
      subject: `Booking Approved - ${booking.space.name}`,
      html: `
        <h2>Booking Approved!</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>Great news! Your booking request has been approved.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Space:</strong> ${booking.space.name}</li>
          <li><strong>Start:</strong> ${new Date(booking.startDate).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(booking.endDate).toLocaleString()}</li>
          <li><strong>Attendees:</strong> ${booking.attendees}</li>
        </ul>
        ${booking.adminComment ? `<p><strong>Admin Note:</strong> ${booking.adminComment}</p>` : ''}
        <p>We look forward to seeing you at Coders HQ!</p>
        <p>Best regards,<br>Coders HQ Team</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending approval email:', error);
    }
  }

  async sendBookingDeniedEmail(booking: any) {
    const msg = {
      to: booking.email,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@codershq.ae',
      subject: `Booking Request Denied - ${booking.space.name}`,
      html: `
        <h2>Booking Request Update</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>Unfortunately, we are unable to approve your booking request at this time.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Space:</strong> ${booking.space.name}</li>
          <li><strong>Start:</strong> ${new Date(booking.startDate).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(booking.endDate).toLocaleString()}</li>
        </ul>
        ${booking.adminComment ? `<p><strong>Reason:</strong> ${booking.adminComment}</p>` : ''}
        <p>Please feel free to submit another request or contact us for more information.</p>
        <p>Best regards,<br>Coders HQ Team</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending denial email:', error);
    }
  }

  async sendEditRequestedEmail(booking: any) {
    const msg = {
      to: booking.email,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@codershq.ae',
      subject: `Update Required - ${booking.space.name}`,
      html: `
        <h2>Booking Update Required</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>We need some additional information or changes for your booking request.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Space:</strong> ${booking.space.name}</li>
          <li><strong>Start:</strong> ${new Date(booking.startDate).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(booking.endDate).toLocaleString()}</li>
        </ul>
        <p><strong>Required Changes:</strong> ${booking.adminComment}</p>
        <p>Please update your booking request or contact us for clarification.</p>
        <p>Best regards,<br>Coders HQ Team</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending edit request email:', error);
    }
  }
}
