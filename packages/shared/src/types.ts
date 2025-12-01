export enum UserRole {
  ADMIN = 'admin',
  SESSION_LEADER = 'session_leader',
  STAKE_PRESIDENT = 'stake_president',
  BISHOP = 'bishop',
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
  phone?: string;
  picture?: string;
  pendingWard?: string;
  pendingStake?: string;
  googleId?: string;
  createdAt: string;
}

export interface ApplicationMemo {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationComment {
  id: string;
  recommendationId?: string;
  applicationId?: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  updatedAt: string;
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
  servedMission?: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  linkedApplicationId?: string;
  memos?: ApplicationMemo[];
}

export interface LeaderRecommendation {
  id: string;
  leaderId: string;
  name: string;
  age: number;
  email?: string;
  phone: string;
  stake: string;
  ward: string;
  gender: Gender;
  moreInfo: string;
  servedMission?: boolean;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
  linkedApplicationId?: string;
  comments?: RecommendationComment[];
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
  servedMission?: boolean;
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
  servedMission?: boolean;
  status?: ApplicationStatus;
}

export interface CreateRecommendationDto {
  name: string;
  age: number;
  email?: string;
  phone: string;
  stake: string;
  ward: string;
  gender: Gender;
  moreInfo?: string;
  servedMission?: boolean;
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
  servedMission?: boolean;
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

export interface UpdateUserProfileDto {
  ward?: string;
  stake?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface StakeWardChangeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  currentStake: string;
  currentWard: string;
  requestedStake: string;
  requestedWard: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
}

export interface CreateStakeWardChangeRequestDto {
  stake: string;
  ward: string;
}

export interface ApproveStakeWardChangeDto {
  requestId: string;
  approved: boolean;
}

export interface CreateMemoDto {
  content: string;
}

export interface UpdateMemoDto {
  content: string;
}

export interface CreateRecommendationCommentDto {
  content: string;
}

export interface UpdateRecommendationCommentDto {
  content: string;
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

export interface ExchangeCodeDto {
  code: string;
}
