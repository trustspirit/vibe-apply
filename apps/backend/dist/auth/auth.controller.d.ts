import { AuthService } from './auth.service';
import type { CreateUserDto, SignInDto, UpdateUserRoleDto, UpdateLeaderStatusDto, User, TokenResponse, RefreshTokenDto, GoogleOAuthDto, JwtPayload } from '@vibe-apply/shared';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(createUserDto: CreateUserDto): Promise<TokenResponse>;
    signIn(signInDto: SignInDto): Promise<TokenResponse>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse>;
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: {
        user: GoogleOAuthDto;
    }): Promise<TokenResponse>;
    getAllUsers(): Promise<User[]>;
    getUser(uid: string): Promise<User>;
    getProfile(user: JwtPayload): Promise<User>;
    updateUserRole(uid: string, updateUserRoleDto: UpdateUserRoleDto): Promise<{
        message: string;
    }>;
    updateLeaderStatus(uid: string, updateLeaderStatusDto: UpdateLeaderStatusDto): Promise<{
        message: string;
    }>;
}
