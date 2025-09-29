import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateUserDto, SignInDto, UserRole, LeaderStatus, User, TokenResponse, RefreshTokenDto, GoogleOAuthDto } from '@vibe-apply/shared';
export declare class AuthService {
    private firebaseService;
    private jwtService;
    constructor(firebaseService: FirebaseService, jwtService: JwtService);
    private generateTokens;
    signUp(createUserDto: CreateUserDto): Promise<TokenResponse>;
    signIn(signInDto: SignInDto): Promise<TokenResponse>;
    getUser(uid: string): Promise<User>;
    updateUserRole(uid: string, role: UserRole): Promise<void>;
    updateLeaderStatus(uid: string, leaderStatus: LeaderStatus): Promise<void>;
    getAllUsers(): Promise<User[]>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse>;
    googleLogin(googleUser: GoogleOAuthDto): Promise<TokenResponse>;
}
