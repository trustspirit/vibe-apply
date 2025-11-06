import { UserRole, LeaderStatus } from '../types';
/**
 * Leader roles that have permission to review applications
 */
export const LEADER_ROLES = [
    UserRole.SESSION_LEADER,
    UserRole.BISHOP,
    UserRole.STAKE_PRESIDENT,
];
/**
 * Check if a role is a leader role
 * @param role - The user role to check
 * @returns true if the role is a leader role
 */
export function isLeaderRole(role) {
    if (!role)
        return false;
    return LEADER_ROLES.includes(role);
}
/**
 * Check if a user is an approved leader
 * @param user - The user to check
 * @returns true if the user is a leader with approved status
 */
export function isApprovedLeader(user) {
    if (!user || !user.role)
        return false;
    return isLeaderRole(user.role) && user.leaderStatus === LeaderStatus.APPROVED;
}
/**
 * Check if a user is an admin
 * @param role - The user role to check
 * @returns true if the role is admin
 */
export function isAdmin(role) {
    return role === UserRole.ADMIN;
}
/**
 * Check if a user has permission to review applications
 * @param user - The user to check
 * @returns true if the user can review applications (admin or approved leader)
 */
export function canReviewApplications(user) {
    if (!user || !user.role)
        return false;
    return isAdmin(user.role) || isApprovedLeader(user);
}
/**
 * Normalize a user role to a valid UserRole enum value
 * @param role - The role to normalize
 * @returns A valid UserRole or APPLICANT as default
 */
export function normalizeUserRole(role) {
    if (!role)
        return UserRole.APPLICANT;
    const validRoles = Object.values(UserRole);
    if (validRoles.includes(role)) {
        return role;
    }
    return UserRole.APPLICANT;
}
