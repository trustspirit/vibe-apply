export enum UserRole {
  ADMIN = 'admin',
  LEADER = 'leader',
  APPLICANT = 'applicant',
}

export enum LeaderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  AWAITING = 'awaiting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum RecommendationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole | null;
  leaderStatus: LeaderStatus | null;
  ward: string;
  stake: string;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: Gender;
  moreInfo: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderRecommendation {
  id: string;
  leaderId: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: Gender;
  moreInfo: string;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface SignInDto {
  email: string;
  name: string;
  password: string;
}

export interface CreateApplicationDto {
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: Gender;
  moreInfo?: string;
  status?: ApplicationStatus;
}

export interface UpdateApplicationDto {
  name?: string;
  age?: number;
  email?: string;
  phone?: string;
  stake?: string;
  ward?: string;
  gender?: Gender;
  moreInfo?: string;
  status?: ApplicationStatus;
}

export interface CreateRecommendationDto {
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: Gender;
  moreInfo?: string;
  status?: RecommendationStatus;
}

export interface UpdateRecommendationDto {
  name?: string;
  age?: number;
  email?: string;
  phone?: string;
  stake?: string;
  ward?: string;
  gender?: Gender;
  moreInfo?: string;
  status?: RecommendationStatus;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface CompleteProfileDto {
  role: UserRole;
  ward: string;
  stake: string;
}

export interface UpdateLeaderStatusDto {
  leaderStatus: LeaderStatus;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole | null;
  leaderStatus?: LeaderStatus;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface GoogleOAuthDto {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}
