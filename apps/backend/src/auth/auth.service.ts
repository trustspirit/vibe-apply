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
    const { name, email, password, role } = createUserDto;

    try {
      const userRecord = await this.firebaseService.createUser(
        email,
        password,
        name,
      );

      const leaderStatus =
        role === UserRole.LEADER ? LeaderStatus.PENDING : null;

      const user: User = {
        id: userRecord.uid,
        name,
        email,
        password: '',
        role,
        leaderStatus,
        createdAt: new Date().toISOString(),
      };

      await this.firebaseService
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          name,
          email,
          role,
          leaderStatus,
          createdAt: user.createdAt,
        });

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;

      return {
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
        role: userData.role as UserRole,
        leaderStatus: (userData.leaderStatus as LeaderStatus) || null,
        createdAt: userData.createdAt as string,
      };

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password2, ...userWithoutPassword } = user;

      return {
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
      role: userData.role as UserRole,
      leaderStatus: (userData.leaderStatus as LeaderStatus) || null,
      createdAt: userData.createdAt as string,
    };
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    const leaderStatus = role === UserRole.LEADER ? LeaderStatus.PENDING : null;

    await this.firebaseService
      .getFirestore()
      .collection('users')
      .doc(uid)
      .update({
        role,
        leaderStatus,
      });
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
        role: data.role as UserRole,
        leaderStatus: (data.leaderStatus as LeaderStatus) || null,
        createdAt: data.createdAt as string,
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
        ...tokens,
        user: userWithoutPassword,
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

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password4, ...userWithoutPassword } = user;

      return {
        ...tokens,
        user: userWithoutPassword,
      };
    } catch {
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
        role: UserRole.APPLICANT,
        leaderStatus: null,
        createdAt: new Date().toISOString(),
      };

      await this.firebaseService
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          name: user.name,
          email: user.email,
          role: user.role,
          leaderStatus: user.leaderStatus,
          createdAt: user.createdAt,
          googleId: googleUser.googleId,
          picture: googleUser.picture,
        });

      const tokens = this.generateTokens(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password5, ...userWithoutPassword } = user;

      return {
        ...tokens,
        user: userWithoutPassword,
      };
    }
  }
}
