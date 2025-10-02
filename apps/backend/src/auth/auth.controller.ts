import type { Response } from 'express';
import {
  Res,
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '@vibe-apply/shared';
import type {
  CreateUserDto,
  SignInDto,
  UpdateUserRoleDto,
  CompleteProfileDto,
  UpdateLeaderStatusDto,
  UpdateUserProfileDto,
  User,
  TokenResponse,
  RefreshTokenDto,
  GoogleOAuthDto,
  JwtPayload,
} from '@vibe-apply/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<void> {
    const tokenResponse = await this.authService.signUp(createUserDto);

    // Set HTTP-only cookies for tokens
    res.cookie('token', tokenResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refresh-token', tokenResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ isNewUser: Boolean(tokenResponse.isNewUser) });
  }

  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res() res: Response,
  ): Promise<void> {
    const tokenResponse = await this.authService.signIn(signInDto);

    // Set HTTP-only cookies for tokens
    res.cookie('token', tokenResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refresh-token', tokenResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ isNewUser: Boolean(tokenResponse.isNewUser) });
  }

  @Post('signout')
  signOut(@Res() res: Response): void {
    // Clear HTTP-only cookies
    res.clearCookie('token');
    res.clearCookie('refresh-token');

    res.json({ message: 'Signed out successfully' });
  }

  @Post('refresh')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(): Promise<void> {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(
    @Req() req: { user: GoogleOAuthDto },
    @Res() res: Response,
  ): Promise<void> {
    const tokenResponse = await this.authService.googleLogin(req.user);

    // Set HTTP-only cookies for tokens
    res.cookie('token', tokenResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refresh-token', tokenResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with only newUser parameter
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?newUser=${Boolean(tokenResponse.isNewUser)}`;

    res.redirect(redirectUrl);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(): Promise<User[]> {
    return this.authService.getAllUsers();
  }

  @Get('users/:uid')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('uid') uid: string): Promise<User> {
    return this.authService.getUser(uid);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: JwtPayload): Promise<User> {
    return this.authService.getUser(user.sub);
  }

  @Put('users/:uid/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserRole(
    @Param('uid') uid: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<{ message: string }> {
    await this.authService.updateUserRole(uid, updateUserRoleDto.role);
    return { message: 'User role updated successfully' };
  }

  @Put('users/:uid/leader-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateLeaderStatus(
    @Param('uid') uid: string,
    @Body() updateLeaderStatusDto: UpdateLeaderStatusDto,
  ): Promise<{ message: string }> {
    await this.authService.updateLeaderStatus(
      uid,
      updateLeaderStatusDto.leaderStatus,
    );
    return { message: 'Leader status updated successfully' };
  }

  @Put('profile/complete')
  @UseGuards(JwtAuthGuard)
  async completeProfile(
    @CurrentUser() user: JwtPayload,
    @Body() completeProfileDto: CompleteProfileDto,
  ): Promise<User> {
    await this.authService.updateUserRole(
      user.sub,
      completeProfileDto.role,
      completeProfileDto.ward,
      completeProfileDto.stake,
    );
    return this.authService.getUser(user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    return this.authService.updateUserProfile(user.sub, updateUserProfileDto);
  }
}
