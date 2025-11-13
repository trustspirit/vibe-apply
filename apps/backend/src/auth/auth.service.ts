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

  private mapFirestoreDataToUser(
    uid: string,
    data: Record<string, any>,
  ): User {
    return {
      id: uid,
      name: data.name as string,
      email: data.email as string,
      password: '',
      role: (data.role as UserRole) || null,
      leaderStatus: (data.leaderStatus as LeaderStatus) || null,
      createdAt: data.createdAt as string,
      ward: (data.ward as string) || '',
      stake: (data.stake as string) || '',
      phone: (data.phone as string) || undefined,
      picture: (data.picture as string) || undefined,
    };
  }

  private omitPassword(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  generateAuthorizationCode(
    accessToken: string,
    refreshToken: string,
  ): string {
    const codePayload = {
      accessToken,
      refreshToken,
    };
    return this.jwtService.sign(codePayload, { expiresIn: '60s' });
  }

  validateAuthorizationCode(code: string): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const decoded: { accessToken: string; refreshToken: string } =
        this.jwtService.verify(code);
      return {
        accessToken: decoded.accessToken,
        refreshToken: decoded.refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }
  }

  async signUp(createUserDto: CreateUserDto): Promise<TokenResponse> {
    const { name, email, password } = createUserDto;

    try {
      const userRecord = await this.firebaseService.createUser(
        email,
        password,
        name,
      );

      const createdAt = new Date().toISOString();
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
        createdAt,
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
          createdAt,
        });

      const tokens = this.generateTokens(user);

      return {
        isNewUser: true,
        ...tokens,
        user: this.omitPassword(user),
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

      const user = this.mapFirestoreDataToUser(userRecord.uid, userData);
      const tokens = this.generateTokens(user);

      return {
        isNewUser: false,
        ...tokens,
        user: this.omitPassword(user),
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

    return this.mapFirestoreDataToUser(uid, userData);
  }

  async updateUserRole(
    uid: string,
    role: UserRole,
    ward?: string,
    stake?: string,
  ): Promise<void> {
    const isLeaderRole = 
      role === UserRole.BISHOP || 
      role === UserRole.STAKE_PRESIDENT ||
      role === UserRole.SESSION_LEADER;
    const leaderStatus = isLeaderRole ? LeaderStatus.PENDING : null;

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
      updateData.ward = ward.trim().toLowerCase();
    }
    if (stake !== undefined) {
      updateData.stake = stake.trim().toLowerCase();
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
      return this.mapFirestoreDataToUser(doc.id, data);
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(
        refreshTokenDto.refreshToken,
      );
      const user = await this.getUser(payload.sub);

      const tokens = this.generateTokens(user);

      return {
        isNewUser: false,
        ...tokens,
        user: this.omitPassword(user),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(googleUser: GoogleOAuthDto): Promise<TokenResponse> {
    try {
      const userRecord = await this.firebaseService
        .getAuth()
        .getUserByEmail(googleUser.email);
      const user = await this.getUser(userRecord.uid);

      if (googleUser.picture && (!user.picture || googleUser.picture !== user.picture)) {
        await this.firebaseService
          .getFirestore()
          .collection('users')
          .doc(userRecord.uid)
          .update({
            picture: googleUser.picture,
          });
        user.picture = googleUser.picture;
      }

      const tokens = this.generateTokens(user);

      return {
        isNewUser: false,
        ...tokens,
        user: this.omitPassword(user),
      };
    } catch {
      const userRecord = await this.firebaseService.createUser(
        googleUser.email,
        Math.random().toString(36),
        googleUser.name,
      );

      const createdAt = new Date().toISOString();
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
        picture: googleUser.picture,
        createdAt,
      };

      await this.firebaseService
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          name: user.name,
          email: user.email,
          ...(user.role && { role: user.role }),
          leaderStatus: user.leaderStatus,
          ward: user.ward,
          stake: user.stake,
          createdAt,
          googleId: googleUser.googleId,
          picture: googleUser.picture,
        });

      const tokens = this.generateTokens(user);

      return {
        isNewUser: true,
        ...tokens,
        user: this.omitPassword(user),
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
    const oldPhone: string = (user.phone) || '';

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
      updateData.ward = ward.trim().toLowerCase();
    }

    if (stake !== undefined) {
      updateData.stake = stake.trim().toLowerCase();
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
          appUpdateData.ward = ward.trim().toLowerCase();
        }
        if (stakeChanged && stake !== undefined) {
          appUpdateData.stake = stake.trim().toLowerCase();
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
            recUpdateData.ward = ward.trim().toLowerCase();
          }
          if (stakeChanged && stake !== undefined) {
            recUpdateData.stake = stake.trim().toLowerCase();
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
