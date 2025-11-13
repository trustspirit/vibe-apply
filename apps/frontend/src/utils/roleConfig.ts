/**
 * Role-based configuration for navigation and UI display
 */

import { USER_ROLES, LEADER_STATUS, ROUTES } from './constants';

export interface NavItem {
  to: string;
  label: string;
}

export interface RoleConfig {
  navItems: (isApprovedLeader?: boolean) => NavItem[];
  greeting: string;
  label: (isApprovedLeader?: boolean) => string;
}

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Configuration map for each user role
 */
export const ROLE_CONFIG_MAP: Record<UserRole, RoleConfig> = {
  [USER_ROLES.ADMIN]: {
    navItems: () => [
      { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
      { to: ROUTES.ADMIN_REVIEW, label: 'Review Applications' },
      { to: ROUTES.ADMIN_ROLES, label: 'Manage Roles' },
    ],
    greeting: 'Admin',
    label: () => 'Admin',
  },
  [USER_ROLES.SESSION_LEADER]: {
    navItems: () => [
      { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
      { to: ROUTES.ADMIN_REVIEW, label: 'Review Applications' },
    ],
    greeting: 'Session Leader',
    label: (isApprovedLeader = false) =>
      isApprovedLeader ? 'Session Leader' : 'Session Leader (Pending)',
  },
  [USER_ROLES.BISHOP]: {
    navItems: (isApprovedLeader = false) => {
      if (isApprovedLeader) {
        return [
          { to: ROUTES.LEADER_DASHBOARD, label: 'Leader Dashboard' },
          { to: ROUTES.LEADER_RECOMMENDATIONS, label: 'Recommendations' },
        ];
      }
      return [
        { to: ROUTES.LEADER_PENDING, label: 'Leader Access' },
        { to: ROUTES.LEADER_RECOMMENDATIONS, label: 'Recommendations' },
      ];
    },
    greeting: 'Bishop',
    label: (isApprovedLeader = false) =>
      isApprovedLeader ? 'Bishop' : 'Bishop (Pending)',
  },
  [USER_ROLES.STAKE_PRESIDENT]: {
    navItems: (isApprovedLeader = false) => {
      if (isApprovedLeader) {
        return [
          { to: ROUTES.LEADER_DASHBOARD, label: 'Leader Dashboard' },
          { to: ROUTES.LEADER_RECOMMENDATIONS, label: 'Recommendations' },
        ];
      }
      return [
        { to: ROUTES.LEADER_PENDING, label: 'Leader Access' },
        { to: ROUTES.LEADER_RECOMMENDATIONS, label: 'Recommendations' },
      ];
    },
    greeting: 'Stake President',
    label: (isApprovedLeader = false) =>
      isApprovedLeader ? 'Stake President' : 'Stake President (Pending)',
  },
  [USER_ROLES.APPLICANT]: {
    navItems: () => [{ to: ROUTES.APPLICATION, label: 'Application' }],
    greeting: 'Applicant',
    label: () => 'Applicant',
  },
};

/**
 * Get role configuration for a specific user role
 */
export const getRoleConfig = (
  role: UserRole,
  leaderStatus?: string
): {
  navItems: NavItem[];
  greeting: string;
  label: string;
} => {
  const config = ROLE_CONFIG_MAP[role];
  if (!config) {
    // Fallback for unknown roles
    return {
      navItems: [],
      greeting: 'User',
      label: 'User',
    };
  }

  const isApprovedLeader = leaderStatus === LEADER_STATUS.APPROVED;

  return {
    navItems: config.navItems(isApprovedLeader),
    greeting: config.greeting,
    label: config.label(isApprovedLeader),
  };
};
