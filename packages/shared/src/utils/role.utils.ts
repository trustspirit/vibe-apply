import { UserRole, LeaderStatus, type User } from '../index';

/**
 * Leader roles that have permission to review applications
 */
export const LEADER_ROLES = [
  UserRole.SESSION_LEADER,
  UserRole.BISHOP,
  UserRole.STAKE_PRESIDENT,
] as const;

/**
 * Check if a role is a leader role
 * @param role - The user role to check
 * @returns true if the role is a leader role
 */
export function isLeaderRole(role: UserRole | null): boolean {
  if (!role) return false;
  return LEADER_ROLES.includes(role as typeof LEADER_ROLES[number]);
}

/**
 * Check if a user is an approved leader
 * @param user - The user to check
 * @returns true if the user is a leader with approved status
 */
export function isApprovedLeader(
  user: Pick<User, 'role' | 'leaderStatus'> | null
): boolean {
  if (!user || !user.role) return false;
  return isLeaderRole(user.role) && user.leaderStatus === LeaderStatus.APPROVED;
}

/**
 * Check if a user is an admin
 * @param role - The user role to check
 * @returns true if the role is admin
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if a user has permission to review applications
 * @param user - The user to check
 * @returns true if the user can review applications (admin or approved leader)
 */
export function canReviewApplications(
  user: Pick<User, 'role' | 'leaderStatus'> | null
): boolean {
  if (!user || !user.role) return false;
  return isAdmin(user.role) || isApprovedLeader(user);
}

/**
 * Normalize a user role to a valid UserRole enum value
 * @param role - The role to normalize
 * @returns A valid UserRole or APPLICANT as default
 */
export function normalizeUserRole(role: string | UserRole | null): UserRole {
  if (!role) return UserRole.APPLICANT;

  const validRoles = Object.values(UserRole);
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return UserRole.APPLICANT;
}
