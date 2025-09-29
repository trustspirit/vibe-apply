"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const firebase_service_1 = require("../firebase/firebase.service");
const shared_1 = require("@vibe-apply/shared");
let AuthService = class AuthService {
    firebaseService;
    jwtService;
    constructor(firebaseService, jwtService) {
        this.firebaseService = firebaseService;
        this.jwtService = jwtService;
    }
    generateTokens(user) {
        const payload = {
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
    async signUp(createUserDto) {
        const { name, email, password, role } = createUserDto;
        try {
            const userRecord = await this.firebaseService.createUser(email, password, name);
            const leaderStatus = role === shared_1.UserRole.LEADER ? shared_1.LeaderStatus.PENDING : null;
            const user = {
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
            const { password: _password, ...userWithoutPassword } = user;
            return {
                ...tokens,
                user: userWithoutPassword,
            };
        }
        catch (error) {
            if (error?.code === 'auth/email-already-exists') {
                throw new common_1.ConflictException('Email already in use');
            }
            throw error;
        }
    }
    async signIn(signInDto) {
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
                throw new common_1.UnauthorizedException('User not found');
            }
            const userData = userDoc.data();
            if (!userData) {
                throw new common_1.UnauthorizedException('User data not found');
            }
            const user = {
                id: userRecord.uid,
                name: userData.name,
                email: userData.email,
                password: '',
                role: userData.role,
                leaderStatus: userData.leaderStatus || null,
                createdAt: userData.createdAt,
            };
            const tokens = this.generateTokens(user);
            const { password: _password2, ...userWithoutPassword } = user;
            return {
                ...tokens,
                user: userWithoutPassword,
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async getUser(uid) {
        const userDoc = await this.firebaseService
            .getFirestore()
            .collection('users')
            .doc(uid)
            .get();
        if (!userDoc.exists) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const userData = userDoc.data();
        if (!userData) {
            throw new common_1.UnauthorizedException('User data not found');
        }
        return {
            id: uid,
            name: userData.name,
            email: userData.email,
            password: '',
            role: userData.role,
            leaderStatus: userData.leaderStatus || null,
            createdAt: userData.createdAt,
        };
    }
    async updateUserRole(uid, role) {
        const leaderStatus = role === shared_1.UserRole.LEADER ? shared_1.LeaderStatus.PENDING : null;
        await this.firebaseService
            .getFirestore()
            .collection('users')
            .doc(uid)
            .update({
            role,
            leaderStatus,
        });
    }
    async updateLeaderStatus(uid, leaderStatus) {
        await this.firebaseService
            .getFirestore()
            .collection('users')
            .doc(uid)
            .update({
            leaderStatus,
        });
    }
    async getAllUsers() {
        const usersSnapshot = await this.firebaseService
            .getFirestore()
            .collection('users')
            .get();
        return usersSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                password: '',
                role: data.role,
                leaderStatus: data.leaderStatus || null,
                createdAt: data.createdAt,
            };
        });
    }
    async refreshToken(refreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
            const user = await this.getUser(payload.sub);
            const tokens = this.generateTokens(user);
            const { password: _password3, ...userWithoutPassword } = user;
            return {
                ...tokens,
                user: userWithoutPassword,
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async googleLogin(googleUser) {
        try {
            const userRecord = await this.firebaseService
                .getAuth()
                .getUserByEmail(googleUser.email);
            const user = await this.getUser(userRecord.uid);
            const tokens = this.generateTokens(user);
            const { password: _password4, ...userWithoutPassword } = user;
            return {
                ...tokens,
                user: userWithoutPassword,
            };
        }
        catch {
            const userRecord = await this.firebaseService.createUser(googleUser.email, Math.random().toString(36), googleUser.name);
            const user = {
                id: userRecord.uid,
                name: googleUser.name,
                email: googleUser.email,
                password: '',
                role: shared_1.UserRole.APPLICANT,
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
            const { password: _password5, ...userWithoutPassword } = user;
            return {
                ...tokens,
                user: userWithoutPassword,
            };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map