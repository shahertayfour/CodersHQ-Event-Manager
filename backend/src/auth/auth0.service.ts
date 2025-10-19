import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManagementClient, AuthenticationClient } from 'auth0';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Auth0Service {
  private management: ManagementClient;
  private authentication: AuthenticationClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const domain = this.configService.get<string>('AUTH0_DOMAIN') || '';
    const clientId = this.configService.get<string>('AUTH0_CLIENT_ID') || '';
    const clientSecret = this.configService.get<string>('AUTH0_CLIENT_SECRET') || '';

    this.management = new ManagementClient({
      domain,
      clientId,
      clientSecret,
    });

    this.authentication = new AuthenticationClient({
      domain,
      clientId,
      clientSecret,
    });
  }

  async getUserInfo(accessToken: string) {
    try {
      // Use userInfo endpoint instead of getProfile
      const response = await fetch(`https://${this.configService.get('AUTH0_DOMAIN')}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting user info from Auth0:', error);
      throw error;
    }
  }

  async syncUserToDatabase(auth0User: any) {
    const email = auth0User.email;

    if (!email) {
      throw new Error('Email not found in Auth0 user profile');
    }

    // Extract name parts
    const firstName =
      auth0User.given_name ||
      auth0User.name?.split(' ')[0] ||
      email.split('@')[0];
    const lastName = auth0User.family_name || auth0User.name?.split(' ')[1];

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        emailVerified: auth0User.email_verified || false,
      },
      create: {
        email,
        firstName,
        lastName,
        emailVerified: auth0User.email_verified || false,
      },
    });

    return user;
  }

  async getUserByAuth0Id(auth0Id: string) {
    // Auth0 ID format: auth0|xxxxx or google-oauth2|xxxxx
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: auth0Id }, { email: { contains: auth0Id } }],
      },
    });

    return user;
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async assignRole(userId: string, roleName: 'USER' | 'ADMIN') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: roleName },
    });
  }

  async getAllAuth0Users() {
    try {
      const users = await this.management.users.getAll();
      return users.data;
    } catch (error) {
      console.error('Error fetching Auth0 users:', error);
      throw error;
    }
  }
}
