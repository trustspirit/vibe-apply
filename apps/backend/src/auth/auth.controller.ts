import {
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
  ): Promise<TokenResponse> {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<TokenResponse> {
    return this.authService.signIn(signInDto);
  }

  @Post('signout')
  signOut(): { message: string } {
    return { message: 'Signed out successfully' };
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
  ): Promise<TokenResponse> {
    return this.authService.googleLogin(req.user);
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
