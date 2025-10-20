import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
    private configService: ConfigService,
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

  // Embedded Auth0 Authentication Methods
  async auth0Register(registerDto: any) {
    try {
      const { email, password, firstName, lastName, phoneNumber, entity, jobTitle } = registerDto;

      console.log('Creating Auth0 user:', email);

      // Check if user already exists in Auth0
      const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN');
      const managementToken = await this.getAuth0ManagementToken();

      // Check local database first
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Create user in Auth0
      const auth0Response = await fetch(`https://${auth0Domain}/api/v2/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managementToken}`
        },
        body: JSON.stringify({
          email,
          password,
          connection: 'Username-Password-Authentication',
          email_verified: false,
          given_name: firstName,
          family_name: lastName,
          name: `${firstName} ${lastName}`,
          user_metadata: {
            phoneNumber,
            entity,
            jobTitle
          }
        })
      });

      if (!auth0Response.ok) {
        const error = await auth0Response.json();
        console.error('Auth0 user creation error:', error);
        throw new BadRequestException(error.message || 'Failed to create Auth0 user');
      }

      const auth0User = await auth0Response.json();
      console.log('Auth0 user created:', auth0User.user_id);

      // Create user in local database
      const user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          phoneNumber,
          entity,
          jobTitle,
          googleId: auth0User.user_id, // Store Auth0 ID
          emailVerified: false,
        },
      });

      console.log('Local user created:', user.id);

      // Generate JWT token
      return this.generateTokens(user);
    } catch (error) {
      console.error('Error in auth0Register:', error);
      throw error;
    }
  }

  async auth0Login(loginDto: any) {
    try {
      const { email, password } = loginDto;

      console.log('Auth0 login attempt:', email);

      // Authenticate with Auth0
      const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN');
      const clientId = this.configService.get<string>('AUTH0_CLIENT_ID');
      const clientSecret = this.configService.get<string>('AUTH0_CLIENT_SECRET');

      const auth0Response = await fetch(`https://${auth0Domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'password',
          username: email,
          password,
          client_id: clientId,
          client_secret: clientSecret,
          audience: `https://${auth0Domain}/api/v2/`,
          scope: 'openid profile email'
        })
      });

      if (!auth0Response.ok) {
        const error = await auth0Response.json();
        console.error('Auth0 login error:', error);
        throw new UnauthorizedException('Invalid credentials');
      }

      const auth0TokenData = await auth0Response.json();

      // Get user info from Auth0
      const userInfoResponse = await fetch(`https://${auth0Domain}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${auth0TokenData.access_token}`
        }
      });

      const auth0User = await userInfoResponse.json();
      console.log('Auth0 user info:', auth0User.sub);

      // Find or create user in local database
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Create user if doesn't exist
        const firstName = auth0User.given_name || auth0User.name?.split(' ')[0] || email.split('@')[0];
        const lastName = auth0User.family_name || auth0User.name?.split(' ')[1] || '';

        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            googleId: auth0User.sub,
            emailVerified: auth0User.email_verified || false,
          },
        });
      }

      console.log('Login successful for user:', user.id);

      // Generate JWT token
      return this.generateTokens(user);
    } catch (error) {
      console.error('Error in auth0Login:', error);
      throw error;
    }
  }

  private async getAuth0ManagementToken(): Promise<string> {
    const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN');
    const clientId = this.configService.get<string>('AUTH0_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AUTH0_CLIENT_SECRET');

    const response = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${auth0Domain}/api/v2/`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get Auth0 management token');
    }

    const data = await response.json();
    return data.access_token;
  }
}
