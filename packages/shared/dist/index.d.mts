declare enum UserRole {
    ADMIN = "admin",
    SESSION_LEADER = "session_leader",
    STAKE_PRESIDENT = "stake_president",
    BISHOP = "bishop",
    APPLICANT = "applicant"
}
declare enum LeaderStatus {
    PENDING = "pending",
    APPROVED = "approved"
}
declare enum ApplicationStatus {
    DRAFT = "draft",
    AWAITING = "awaiting",
    APPROVED = "approved",
    REJECTED = "rejected"
}
declare enum RecommendationStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    APPROVED = "approved",
    REJECTED = "rejected"
}
declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
interface User {
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
    createdAt: string;
}
interface ApplicationMemo {
    id: string;
    applicationId: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    content: string;
    createdAt: string;
    updatedAt: string;
}
interface Application {
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
    linkedApplicationId?: string;
    memos?: ApplicationMemo[];
}
interface LeaderRecommendation {
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
    linkedApplicationId?: string;
}
interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}
interface SignInDto {
    email: string;
    name: string;
    password: string;
}
interface CreateApplicationDto {
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
interface UpdateApplicationDto {
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
interface CreateRecommendationDto {
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
interface UpdateRecommendationDto {
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
interface UpdateUserRoleDto {
    role: UserRole;
}
interface CompleteProfileDto {
    role: UserRole;
    ward: string;
    stake: string;
}
interface UpdateUserProfileDto {
    ward?: string;
    stake?: string;
    phone?: string;
}
interface CreateMemoDto {
    content: string;
}
interface UpdateMemoDto {
    content: string;
}
interface UpdateLeaderStatusDto {
    leaderStatus: LeaderStatus;
}
interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    role: UserRole | null;
    leaderStatus?: LeaderStatus;
    iat?: number;
    exp?: number;
}
interface TokenResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
}
interface RefreshTokenDto {
    refreshToken: string;
}
interface GoogleOAuthDto {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
}
interface ExchangeCodeDto {
    code: string;
}

/**
 * Leader roles that have permission to review applications
 */
declare const LEADER_ROLES: readonly [UserRole.SESSION_LEADER, UserRole.BISHOP, UserRole.STAKE_PRESIDENT];
/**
 * Check if a role is a leader role
 * @param role - The user role to check
 * @returns true if the role is a leader role
 */
declare function isLeaderRole(role: UserRole | null): boolean;
/**
 * Check if a user is an approved leader
 * @param user - The user to check
 * @returns true if the user is a leader with approved status
 */
declare function isApprovedLeader(user: Pick<User, 'role' | 'leaderStatus'> | null): boolean;
/**
 * Check if a user is an admin
 * @param role - The user role to check
 * @returns true if the role is admin
 */
declare function isAdmin(role: UserRole | null): boolean;
/**
 * Check if a user has permission to review applications
 * @param user - The user to check
 * @returns true if the user can review applications (admin or approved leader)
 */
declare function canReviewApplications(user: Pick<User, 'role' | 'leaderStatus'> | null): boolean;
/**
 * Normalize a user role to a valid UserRole enum value
 * @param role - The role to normalize
 * @returns A valid UserRole or APPLICANT as default
 */
declare function normalizeUserRole(role: string | UserRole | null): UserRole;

/**
 * Normalize a string by trimming whitespace and converting to lowercase
 * @param value - The string to normalize
 * @returns The normalized string
 */
declare function normalizeString(value: string | null | undefined): string;
/**
 * Normalize an email address
 * @param email - The email to normalize
 * @returns The normalized email
 */
declare function normalizeEmail(email: string | null | undefined): string;
/**
 * Normalize a ward or stake name
 * @param name - The ward/stake name to normalize
 * @returns The normalized name
 */
declare function normalizeWardStakeName(name: string | null | undefined): string;

export { type Application, type ApplicationMemo, ApplicationStatus, type CompleteProfileDto, type CreateApplicationDto, type CreateMemoDto, type CreateRecommendationDto, type CreateUserDto, type ExchangeCodeDto, Gender, type GoogleOAuthDto, type JwtPayload, LEADER_ROLES, type LeaderRecommendation, LeaderStatus, RecommendationStatus, type RefreshTokenDto, type SignInDto, type TokenResponse, type UpdateApplicationDto, type UpdateLeaderStatusDto, type UpdateMemoDto, type UpdateRecommendationDto, type UpdateUserProfileDto, type UpdateUserRoleDto, type User, UserRole, canReviewApplications, isAdmin, isApprovedLeader, isLeaderRole, normalizeEmail, normalizeString, normalizeUserRole, normalizeWardStakeName };
