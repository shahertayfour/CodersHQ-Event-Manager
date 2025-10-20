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
      html: this.getEmailTemplate({
        title: 'Booking Request Received',
        preheader: 'Your booking request is pending approval',
        greeting: `Dear ${booking.firstName} ${booking.lastName},`,
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            Thank you for your booking request! We've received your submission for <strong style="color: #0f172a;">${booking.space.name}</strong> and our team is reviewing it.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            You will receive a notification once your request has been reviewed.
          </p>
        `,
        details: [
          { label: 'Event Name', value: booking.eventName },
          { label: 'Space', value: booking.space.name },
          { label: 'Start Time', value: new Date(booking.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'End Time', value: new Date(booking.endDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'Expected Attendees', value: booking.attendees.toString() },
        ],
        statusBadge: { text: 'Pending Review', color: '#f59e0b' },
      }),
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const adminPanelUrl = `${frontendUrl}/admin.html`;

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: adminEmails.join(', '),
      subject: `New Booking Request - ${booking.space.name}`,
      html: this.getEmailTemplate({
        title: 'New Booking Request',
        preheader: `${booking.firstName} ${booking.lastName} submitted a booking for ${booking.space.name}`,
        greeting: 'Hello Admin,',
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            A new booking request has been submitted and requires your review.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            <strong style="color: #0f172a;">${booking.firstName} ${booking.lastName}</strong> from <strong style="color: #0f172a;">${booking.entity}</strong> has requested to book ${booking.space.name}.
          </p>
        `,
        details: [
          { label: 'Requester Name', value: `${booking.firstName} ${booking.lastName}` },
          { label: 'Email', value: booking.email },
          { label: 'Phone', value: booking.phoneNumber },
          { label: 'Organization', value: booking.entity },
          { label: 'Event Name', value: booking.eventName },
          { label: 'Space', value: booking.space.name },
          { label: 'Start Time', value: new Date(booking.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'End Time', value: new Date(booking.endDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'Expected Attendees', value: booking.attendees.toString() },
          { label: 'Seating Arrangement', value: booking.seating || 'Not specified' },
        ],
        statusBadge: { text: 'Action Required', color: '#3b82f6' },
        cta: { text: 'Review in Admin Panel', url: adminPanelUrl },
      }),
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const dashboardUrl = `${frontendUrl}/dashboard.html`;

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: booking.email,
      subject: `Booking Approved - ${booking.space.name}`,
      html: this.getEmailTemplate({
        title: 'Booking Approved!',
        preheader: `Your booking for ${booking.space.name} has been approved`,
        greeting: `Dear ${booking.firstName} ${booking.lastName},`,
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            Great news! Your booking request for <strong style="color: #0f172a;">${booking.space.name}</strong> has been approved.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            We look forward to hosting your event at Coders HQ!
          </p>
        `,
        details: [
          { label: 'Event Name', value: booking.eventName },
          { label: 'Space', value: booking.space.name },
          { label: 'Start Time', value: new Date(booking.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'End Time', value: new Date(booking.endDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'Expected Attendees', value: booking.attendees.toString() },
        ],
        statusBadge: { text: 'Approved', color: '#10b981' },
        cta: { text: 'View My Bookings', url: dashboardUrl },
        footer: booking.adminComment
          ? `
          <p style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">
            Admin Note:
          </p>
          <p style="margin: 0; color: #475569; font-size: 14px; line-height: 20px; padding: 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
            ${booking.adminComment}
          </p>
        `
          : undefined,
      }),
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const bookingFormUrl = `${frontendUrl}/booking-form.html`;

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: booking.email,
      subject: `Booking Request Update - ${booking.space.name}`,
      html: this.getEmailTemplate({
        title: 'Booking Request Update',
        preheader: `Update regarding your booking for ${booking.space.name}`,
        greeting: `Dear ${booking.firstName} ${booking.lastName},`,
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            Thank you for your interest in booking <strong style="color: #0f172a;">${booking.space.name}</strong> at Coders HQ.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            Unfortunately, we are unable to approve your booking request at this time.
          </p>
        `,
        details: [
          { label: 'Event Name', value: booking.eventName },
          { label: 'Space', value: booking.space.name },
          { label: 'Requested Start', value: new Date(booking.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'Requested End', value: new Date(booking.endDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
        ],
        statusBadge: { text: 'Not Approved', color: '#ef4444' },
        cta: { text: 'Submit New Booking', url: bookingFormUrl },
        footer: booking.adminComment
          ? `
          <p style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">
            Reason:
          </p>
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 20px; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
            ${booking.adminComment}
          </p>
          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
            Please feel free to submit another request with different dates or contact us for more information.
          </p>
        `
          : `
          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
            Please feel free to submit another request with different dates or contact us for more information.
          </p>
        `,
      }),
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const dashboardUrl = `${frontendUrl}/dashboard.html`;

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: booking.email,
      subject: `Action Required - ${booking.space.name} Booking`,
      html: this.getEmailTemplate({
        title: 'Booking Update Required',
        preheader: 'Your booking requires some changes',
        greeting: `Dear ${booking.firstName} ${booking.lastName},`,
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            We've reviewed your booking request for <strong style="color: #0f172a;">${booking.space.name}</strong> and need some additional information or changes before we can approve it.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            Please review the requested changes below and update your booking accordingly.
          </p>
        `,
        details: [
          { label: 'Event Name', value: booking.eventName },
          { label: 'Space', value: booking.space.name },
          { label: 'Start Time', value: new Date(booking.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'End Time', value: new Date(booking.endDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
        ],
        statusBadge: { text: 'Changes Requested', color: '#f59e0b' },
        cta: { text: 'Update My Booking', url: dashboardUrl },
        footer: `
          <p style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">
            Requested Changes:
          </p>
          <p style="margin: 0; color: #475569; font-size: 14px; line-height: 20px; padding: 12px; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 4px;">
            ${booking.adminComment}
          </p>
        `,
      }),
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const adminPanelUrl = `${frontendUrl}/admin.html`;

    const mailOptions = {
      from: `"Coders HQ" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: adminEmails.join(', '),
      subject: `Booking Updated - ${booking.space.name}`,
      html: this.getEmailTemplate({
        title: 'Booking Updated',
        preheader: `${booking.firstName} ${booking.lastName} updated their booking for ${booking.space.name}`,
        greeting: 'Hello Admin,',
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            A booking request has been updated and is ready for your review.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            <strong style="color: #0f172a;">${booking.firstName} ${booking.lastName}</strong> has made changes to their booking request based on your feedback.
          </p>
        `,
        details: [
          { label: 'Requester Name', value: `${booking.firstName} ${booking.lastName}` },
          { label: 'Email', value: booking.email },
          { label: 'Phone', value: booking.phoneNumber },
          { label: 'Organization', value: booking.entity },
          { label: 'Event Name', value: booking.eventName },
          { label: 'Space', value: booking.space.name },
          { label: 'Start Time', value: new Date(booking.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'End Time', value: new Date(booking.endDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
          { label: 'Expected Attendees', value: booking.attendees.toString() },
          { label: 'Seating Arrangement', value: booking.seating || 'Not specified' },
        ],
        statusBadge: { text: 'Re-Review Required', color: '#a855f7' },
        cta: { text: 'Review Updated Booking', url: adminPanelUrl },
      }),
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
      html: this.getEmailTemplate({
        title: 'Reset Your Password',
        preheader: 'Reset your password for CHQ Space Management',
        greeting: `Dear ${user.firstName || 'there'},`,
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            We received a request to reset the password for your <strong style="color: #0f172a;">CHQ Space Management</strong> account.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            Click the button below to create a new password:
          </p>
        `,
        cta: { text: 'Reset Password', url: resetLink },
        footer: `
          <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px; line-height: 20px;">
            This password reset link will expire in <strong>1 hour</strong> for security reasons.
          </p>
          <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; line-height: 20px;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 18px; padding: 12px; background: #f8fafc; border-radius: 4px;">
            <strong>Security tip:</strong> Never share your password reset link with anyone. Our team will never ask for your password.
          </p>
        `,
      }),
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
      html: this.getEmailTemplate({
        title: 'Welcome to CHQ!',
        preheader: 'Please verify your email address',
        greeting: `Dear ${user.firstName || 'there'},`,
        content: `
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 24px;">
            Welcome to <strong style="color: #0f172a;">Coders HQ Space Management</strong>! We're excited to have you join our community.
          </p>
          <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
            To get started, please verify your email address by clicking the button below:
          </p>
        `,
        cta: { text: 'Verify Email Address', url: verifyLink },
        footer: `
          <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px; line-height: 20px;">
            This verification link will expire in <strong>24 hours</strong>.
          </p>
          <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 20px;">
            If you did not create this account, please ignore this email.
          </p>
        `,
      }),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email verification sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email verification:', error);
    }
  }

  private getEmailTemplate(options: {
    title: string;
    preheader?: string;
    greeting: string;
    content: string;
    details?: Array<{ label: string; value: string }>;
    statusBadge?: { text: string; color: string };
    cta?: { text: string; url: string };
    footer?: string;
  }): string {
    const { title, preheader, greeting, content, details, statusBadge, cta, footer } = options;

    const detailsHtml = details
      ? `
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr>
            <td style="padding: 0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; overflow: hidden;">
                ${details
                  .map(
                    (detail) => `
                  <tr>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; font-size: 14px; width: 35%;">
                      ${detail.label}
                    </td>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 14px;">
                      ${detail.value}
                    </td>
                  </tr>
                `,
                  )
                  .join('')}
              </table>
            </td>
          </tr>
        </table>
      `
      : '';

    const statusBadgeHtml = statusBadge
      ? `
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
          <tr>
            <td style="padding: 0; text-align: center;">
              <span style="display: inline-block; padding: 8px 16px; background: ${statusBadge.color}; color: white; border-radius: 6px; font-weight: 600; font-size: 14px;">
                ${statusBadge.text}
              </span>
            </td>
          </tr>
        </table>
      `
      : '';

    const ctaHtml = cta
      ? `
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
          <tr>
            <td style="padding: 0; text-align: center;">
              <a href="${cta.url}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
                ${cta.text}
              </a>
            </td>
          </tr>
        </table>
      `
      : '';

    const footerHtml = footer || '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        ${preheader ? `<style type="text/css">.preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }</style>` : ''}
      </head>
      <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        ${preheader ? `<div class="preheader">${preheader}</div>` : ''}

        <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f1f5f9;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

                <!-- Header -->
                <tr>
                  <td style="padding: 32px 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.02em;">
                      CHQ
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8; font-weight: 500; letter-spacing: 0.05em;">
                      SPACE MANAGEMENT
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #0f172a;">
                      ${title}
                    </h2>

                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px;">
                      ${greeting}
                    </p>

                    ${content}
                    ${statusBadgeHtml}
                    ${detailsHtml}
                    ${ctaHtml}

                    ${footerHtml ? `<div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">${footerHtml}</div>` : ''}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
                      Best regards,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
                      The Coders HQ Team
                    </p>

                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                      <tr>
                        <td style="padding: 0; text-align: center;">
                          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
                            © ${new Date().getFullYear()} Coders HQ. All rights reserved.
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                            This is an automated message, please do not reply to this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
