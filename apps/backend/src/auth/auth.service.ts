import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import {
  CreateUserDto,
  SignInDto,
  UserRole,
  LeaderStatus,
  User,
  TokenResponse,
  JwtPayload,
  RefreshTokenDto,
  GoogleOAuthDto,
  UpdateUserProfileDto,
} from '@vibe-apply/shared';

/**
 * Authentication service handling user sign up, sign in, and OAuth flows.
 *
 * Google OAuth users can have null roles initially and complete their profile
 * selection later via the PUT /auth/profile/complete endpoint.
 * All users have ward and stake fields for church organization tracking.
 */

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
  ) {}

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      leaderStatus: user.leaderStatus || undefined,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  async signUp(createUserDto: CreateUserDto): Promise<TokenResponse> {
    const { name, email, password } = createUserDto;

    try {
      const userRecord = await this.firebaseService.createUser(
        email,
        password,
        name,
      );

      const user: User = {
        id: userRecord.uid,
        name,
        email,
        password: '',
        role: null,
        leaderStatus: null,
        ward: '',
        stake: '',
        phone: undefined,
        createdAt: new Date().toISOString(),
      };

      await this.firebaseService
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          name,
          email,
          role: null,
          leaderStatus: null,
          ward: '',
          stake: '',
          createdAt: user.createdAt,
        });

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;

      return {
        isNewUser: true,
        ...tokens,
        user: userWithoutPassword,
      };
    } catch (error: any) {
      if ((error as { code?: string })?.code === 'auth/email-already-exists') {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async signIn(signInDto: SignInDto): Promise<TokenResponse> {
    const { email } = signInDto;

    try {
      const userRecord = await this.firebaseService
        .getAuth()
        .getUserByEmail(email);

      const userDoc = await this.firebaseService
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found');
      }

      const userData = userDoc.data();
      if (!userData) {
        throw new UnauthorizedException('User data not found');
      }

      const user: User = {
        id: userRecord.uid,
        name: userData.name as string,
        email: userData.email as string,
        password: '',
        role: (userData.role as UserRole) || null,
        leaderStatus: (userData.leaderStatus as LeaderStatus) || null,
        createdAt: userData.createdAt as string,
        ward: (userData.ward as string) || '',
        stake: (userData.stake as string) || '',
        phone: (userData.phone as string) || undefined,
      };

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password2, ...userWithoutPassword } = user;

      return {
        isNewUser: false,
        ...tokens,
        user: userWithoutPassword,
      };
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async getUser(uid: string): Promise<User> {
    const userDoc = await this.firebaseService
      .getFirestore()
      .collection('users')
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      throw new UnauthorizedException('User not found');
    }

    const userData = userDoc.data();
    if (!userData) {
      throw new UnauthorizedException('User data not found');
    }

    return {
      id: uid,
      name: userData.name as string,
      email: userData.email as string,
      password: '',
      role: (userData.role as UserRole) || null,
      leaderStatus: (userData.leaderStatus as LeaderStatus) || null,
      createdAt: userData.createdAt as string,
      ward: (userData.ward as string) || '',
      stake: (userData.stake as string) || '',
      phone: (userData.phone as string) || undefined,
    };
  }

  async updateUserRole(
    uid: string,
    role: UserRole,
    ward?: string,
    stake?: string,
  ): Promise<void> {
    const leaderStatus = role === UserRole.LEADER ? LeaderStatus.PENDING : null;

    const updateData: {
      role: UserRole;
      leaderStatus: LeaderStatus | null;
      ward?: string;
      stake?: string;
    } = {
      role,
      leaderStatus,
    };

    if (ward !== undefined) {
      updateData.ward = ward;
    }
    if (stake !== undefined) {
      updateData.stake = stake;
    }

    await this.firebaseService
      .getFirestore()
      .collection('users')
      .doc(uid)
      .update(updateData);
  }

  async updateLeaderStatus(
    uid: string,
    leaderStatus: LeaderStatus,
  ): Promise<void> {
    await this.firebaseService
      .getFirestore()
      .collection('users')
      .doc(uid)
      .update({
        leaderStatus,
      });
  }

  async getAllUsers(): Promise<User[]> {
    const usersSnapshot = await this.firebaseService
      .getFirestore()
      .collection('users')
      .get();

    return usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name as string,
        email: data.email as string,
        password: '',
        role: (data.role as UserRole) || null,
        leaderStatus: (data.leaderStatus as LeaderStatus) || null,
        createdAt: data.createdAt as string,
        ward: (data.ward as string) || '',
        stake: (data.stake as string) || '',
        phone: (data.phone as string) || undefined,
      };
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(
        refreshTokenDto.refreshToken,
      );
      const user = await this.getUser(payload.sub);

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password3, ...userWithoutPassword } = user;

      return {
        isNewUser: false,
        ...tokens,
        user: userWithoutPassword,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(googleUser: GoogleOAuthDto): Promise<TokenResponse> {
    try {
      // Try to find existing user
      const userRecord = await this.firebaseService
        .getAuth()
        .getUserByEmail(googleUser.email);
      const user = await this.getUser(userRecord.uid);

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password4, ...userWithoutPassword } = user;

      return {
        isNewUser: false,
        ...tokens,
        user: userWithoutPassword,
      };
    } catch {
      // Create new user if not found
      const userRecord = await this.firebaseService.createUser(
        googleUser.email,
        Math.random().toString(36),
        googleUser.name,
      );

      const user: User = {
        id: userRecord.uid,
        name: googleUser.name,
        email: googleUser.email,
        password: '',
        role: null,
        leaderStatus: null,
        ward: '',
        stake: '',
        phone: undefined,
        createdAt: new Date().toISOString(),
      };

      await this.firebaseService
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          name: user.name,
          email: user.email,
          ...(user.role && { role: user.role }), // Only set role if not null
          leaderStatus: user.leaderStatus,
          createdAt: user.createdAt,
          googleId: googleUser.googleId,
          picture: googleUser.picture,
        });

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password5, ...userWithoutPassword } = user;

      return {
        isNewUser: true,
        ...tokens,
        user: userWithoutPassword,
      };
    }
  }

  async updateUserProfile(
    uid: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.getUser(uid);
    const oldWard = user.ward;
    const oldStake = user.stake;
    const oldPhone: string = (user.phone as string | undefined) || '';

    const updateData: Record<string, string> = {};

    const ward = (updateUserProfileDto as Record<string, any>).ward as
      | string
      | undefined;
    const stake = (updateUserProfileDto as Record<string, any>).stake as
      | string
      | undefined;
    const phone = (updateUserProfileDto as Record<string, any>).phone as
      | string
      | undefined;

    if (ward !== undefined) {
      updateData.ward = ward;
    }

    if (stake !== undefined) {
      updateData.stake = stake;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    await this.firebaseService
      .getFirestore()
      .collection('users')
      .doc(uid)
      .update(updateData);

    const wardChanged = ward !== undefined && ward !== oldWard;
    const stakeChanged = stake !== undefined && stake !== oldStake;
    const phoneChanged = phone !== undefined && phone !== oldPhone;

    if (wardChanged || stakeChanged || phoneChanged) {
      const applicationsSnapshot = await this.firebaseService
        .getFirestore()
        .collection('applications')
        .where('userId', '==', uid)
        .get();

      const appUpdatePromises = applicationsSnapshot.docs.map(async (doc) => {
        const appUpdateData: Record<string, string> = {};
        if (wardChanged && ward !== undefined) {
          appUpdateData.ward = ward;
        }
        if (stakeChanged && stake !== undefined) {
          appUpdateData.stake = stake;
        }
        if (phoneChanged && phone !== undefined) {
          appUpdateData.phone = phone;
        }
        await doc.ref.update(appUpdateData);
      });

      const recommendationsSnapshot = await this.firebaseService
        .getFirestore()
        .collection('recommendations')
        .where('leaderId', '==', uid)
        .get();

      const recUpdatePromises = recommendationsSnapshot.docs.map(
        async (doc) => {
          const recUpdateData: Record<string, string> = {};
          if (wardChanged && ward !== undefined) {
            recUpdateData.ward = ward;
          }
          if (stakeChanged && stake !== undefined) {
            recUpdateData.stake = stake;
          }
          if (phoneChanged && phone !== undefined) {
            recUpdateData.phone = phone;
          }
          await doc.ref.update(recUpdateData);
        },
      );

      await Promise.all([...appUpdatePromises, ...recUpdatePromises]);
    }

    return this.getUser(uid);
  }
}
