"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEADER_ROLES = void 0;
exports.isLeaderRole = isLeaderRole;
exports.isApprovedLeader = isApprovedLeader;
exports.isAdmin = isAdmin;
exports.canReviewApplications = canReviewApplications;
exports.normalizeUserRole = normalizeUserRole;
const index_1 = require("../index");
/**
 * Leader roles that have permission to review applications
 */
exports.LEADER_ROLES = [
    index_1.UserRole.SESSION_LEADER,
    index_1.UserRole.BISHOP,
    index_1.UserRole.STAKE_PRESIDENT,
];
/**
 * Check if a role is a leader role
 * @param role - The user role to check
 * @returns true if the role is a leader role
 */
function isLeaderRole(role) {
    if (!role)
        return false;
    return exports.LEADER_ROLES.includes(role);
}
/**
 * Check if a user is an approved leader
 * @param user - The user to check
 * @returns true if the user is a leader with approved status
 */
function isApprovedLeader(user) {
    if (!user || !user.role)
        return false;
    return isLeaderRole(user.role) && user.leaderStatus === index_1.LeaderStatus.APPROVED;
}
/**
 * Check if a user is an admin
 * @param role - The user role to check
 * @returns true if the role is admin
 */
function isAdmin(role) {
    return role === index_1.UserRole.ADMIN;
}
/**
 * Check if a user has permission to review applications
 * @param user - The user to check
 * @returns true if the user can review applications (admin or approved leader)
 */
function canReviewApplications(user) {
    if (!user || !user.role)
        return false;
    return isAdmin(user.role) || isApprovedLeader(user);
}
/**
 * Normalize a user role to a valid UserRole enum value
 * @param role - The role to normalize
 * @returns A valid UserRole or APPLICANT as default
 */
function normalizeUserRole(role) {
    if (!role)
        return index_1.UserRole.APPLICANT;
    const validRoles = Object.values(index_1.UserRole);
    if (validRoles.includes(role)) {
        return role;
    }
    return index_1.UserRole.APPLICANT;
}
