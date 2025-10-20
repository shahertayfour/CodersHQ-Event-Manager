import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        entity: registerDto.entity,
        jobTitle: registerDto.jobTitle,
        name: registerDto.firstName && registerDto.lastName
          ? `${registerDto.firstName} ${registerDto.lastName}`
          : undefined,
      },
    });

    const { password, ...result } = user;
    return this.generateTokens(result);
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    return this.generateTokens(result);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const { email, firstName, lastName, googleId } = req.user;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          googleId,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    return this.generateTokens(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        name: updateProfileDto.firstName && updateProfileDto.lastName
          ? `${updateProfileDto.firstName} ${updateProfileDto.lastName}`
          : undefined,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  private generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        entity: user.entity,
        jobTitle: user.jobTitle,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  // Password Reset Methods
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // For security, always return success even if user doesn't exist
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    const resetPasswordExpiry = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpiry,
      },
    });

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user, resetToken);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetPasswordDto.token)
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  // Email Verification Methods
  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate a secure random token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Token expires in 24 hours
    const emailVerificationExpiry = new Date(Date.now() + 86400000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationTokenHash,
        emailVerificationExpiry,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerificationEmail(user, verificationToken);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verifyEmailDto.token)
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: verificationTokenHash,
        emailVerificationExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  // Auth0 Integration Methods
  async syncAuth0User(auth0User: any, authHeader?: string) {
    try {
      console.log('Syncing Auth0 user:', auth0User);

      const email = auth0User.email;
      if (!email) {
        throw new BadRequestException('Email not found in Auth0 user profile');
      }

      // Extract user information
      const firstName =
        auth0User.given_name ||
        auth0User.name?.split(' ')[0] ||
        email.split('@')[0];
      const lastName = auth0User.family_name || auth0User.name?.split(' ')[1] || '';

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Update existing user
        user = await this.prisma.user.update({
          where: { email },
          data: {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            emailVerified: auth0User.email_verified || false,
            // Store Auth0 sub if not already stored
            googleId: user.googleId || auth0User.sub,
          },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            emailVerified: auth0User.email_verified || false,
            googleId: auth0User.sub,
          },
        });
      }

      console.log('User synced:', user.email);

      // Generate JWT token for backend API
      return this.generateTokens(user);
    } catch (error) {
      console.error('Error syncing Auth0 user:', error);
      throw error;
    }
  }

  async handleAuth0Callback(req: any) {
    // This is a placeholder for additional Auth0 callback handling if needed
    return { message: 'Auth0 callback handled' };
  }
}
