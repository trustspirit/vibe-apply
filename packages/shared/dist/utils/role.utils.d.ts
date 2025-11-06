import { UserRole, type User } from '../index';
/**
 * Leader roles that have permission to review applications
 */
export declare const LEADER_ROLES: readonly [UserRole.SESSION_LEADER, UserRole.BISHOP, UserRole.STAKE_PRESIDENT];
/**
 * Check if a role is a leader role
 * @param role - The user role to check
 * @returns true if the role is a leader role
 */
export declare function isLeaderRole(role: UserRole | null): boolean;
/**
 * Check if a user is an approved leader
 * @param user - The user to check
 * @returns true if the user is a leader with approved status
 */
export declare function isApprovedLeader(user: Pick<User, 'role' | 'leaderStatus'> | null): boolean;
/**
 * Check if a user is an admin
 * @param role - The user role to check
 * @returns true if the role is admin
 */
export declare function isAdmin(role: UserRole | null): boolean;
/**
 * Check if a user has permission to review applications
 * @param user - The user to check
 * @returns true if the user can review applications (admin or approved leader)
 */
export declare function canReviewApplications(user: Pick<User, 'role' | 'leaderStatus'> | null): boolean;
/**
 * Normalize a user role to a valid UserRole enum value
 * @param role - The role to normalize
 * @returns A valid UserRole or APPLICANT as default
 */
export declare function normalizeUserRole(role: string | UserRole | null): UserRole;
