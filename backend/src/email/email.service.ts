import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailAppPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (gmailUser && gmailAppPassword) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });
      console.log('✅ Email service configured with Gmail');
    } else {
      console.warn('⚠️  Gmail credentials not configured - emails will not be sent');
    }
  }

  async sendBookingReceivedEmail(booking: any) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: booking.email,
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
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Booking confirmation sent to ${booking.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendNewBookingNotificationToAdmins(booking: any, adminEmails: string[]) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: adminEmails.join(', '),
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
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Admin notification sent to ${adminEmails.length} admin(s)`);
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  async sendBookingApprovedEmail(booking: any) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: booking.email,
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
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Approval email sent to ${booking.email}`);
    } catch (error) {
      console.error('Error sending approval email:', error);
    }
  }

  async sendBookingDeniedEmail(booking: any) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: booking.email,
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
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Denial email sent to ${booking.email}`);
    } catch (error) {
      console.error('Error sending denial email:', error);
    }
  }

  async sendEditRequestedEmail(booking: any) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: booking.email,
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
        <p>Please log in to your dashboard and update your booking request.</p>
        <p>Best regards,<br>Coders HQ Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Edit request email sent to ${booking.email}`);
    } catch (error) {
      console.error('Error sending edit request email:', error);
    }
  }

  async sendBookingUpdatedNotification(booking: any, adminEmails: string[]) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: adminEmails.join(', '),
      subject: `Booking Updated - ${booking.space.name}`,
      html: `
        <h2>Booking Updated</h2>
        <p>A booking request has been updated and is pending review:</p>
        <h3>Requester Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</li>
          <li><strong>Email:</strong> ${booking.email}</li>
          <li><strong>Phone:</strong> ${booking.phoneNumber}</li>
          <li><strong>Organization:</strong> ${booking.entity}</li>
        </ul>
        <h3>Updated Booking Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Space:</strong> ${booking.space.name}</li>
          <li><strong>Start:</strong> ${new Date(booking.startDate).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(booking.endDate).toLocaleString()}</li>
          <li><strong>Attendees:</strong> ${booking.attendees}</li>
          <li><strong>Seating:</strong> ${booking.seating}</li>
        </ul>
        <p>Please review this updated request in the admin panel.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Booking updated notification sent to ${adminEmails.length} admin(s)`);
    } catch (error) {
      console.error('Error sending booking updated notification:', error);
    }
  }

  async sendPasswordResetEmail(user: any, resetToken: string) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password.html?token=${resetToken}`;

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: user.email,
      subject: 'Password Reset Request - CHQ Space Management',
      html: `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.firstName || user.email},</p>
        <p>We received a request to reset your password for your CHQ Space Management account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>Coders HQ Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }

  async sendEmailVerificationEmail(user: any, verificationToken: string) {
    if (!this.transporter) {
      console.warn('Email not sent - transporter not configured');
      return;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/verify-email.html?token=${verificationToken}`;

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: user.email,
      subject: 'Verify Your Email - CHQ Space Management',
      html: `
        <h2>Welcome to CHQ Space Management!</h2>
        <p>Dear ${user.firstName || user.email},</p>
        <p>Thank you for registering with Coders HQ Space Management.</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${verifyLink}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>Best regards,<br>Coders HQ Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email verification sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email verification:', error);
    }
  }
}
