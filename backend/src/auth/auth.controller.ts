import { Controller, Post, Body, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 Login attempt:', {
      email: loginDto.email,
      timestamp: new Date().toISOString(),
      headers: 'Check CORS'
    });
    const result = await this.authService.login(loginDto);
    console.log('✅ Login successful for:', loginDto.email);
    return result;
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Post('logout')
  async logout() {
    // JWT is stateless, logout is handled on client side
    return { message: 'Logout successful' };
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  // Password Reset Endpoints
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Email Verification Endpoints
  @Post('send-verification-email')
  async sendVerificationEmail(@CurrentUser() user: any) {
    return this.authService.sendVerificationEmail(user.id);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  // Auth0 Integration Endpoints
  @Public()
  @Post('auth0/sync')
  async syncAuth0User(@Body() body: { auth0User: any }, @Req() req: any) {
    return this.authService.syncAuth0User(body.auth0User, req.headers.authorization);
  }

  @Public()
  @Get('auth0/callback')
  async auth0Callback(@Req() req: any) {
    return this.authService.handleAuth0Callback(req);
  }
}
