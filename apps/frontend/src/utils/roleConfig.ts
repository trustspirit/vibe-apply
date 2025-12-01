/**
 * Role-based configuration for navigation and UI display
 */

import type { TFunction } from 'i18next';
import { UserRole, LeaderStatus, ROUTES } from './constants';

export interface NavItem {
  to: string;
  label: string;
}

/**
 * Get role configuration for a specific user role
 */
export const getRoleConfig = (
  role: UserRole | null,
  leaderStatus: string | undefined | null,
  t: TFunction
): {
  navItems: NavItem[];
  greeting: string;
  label: string;
} => {
  const isApprovedLeader = leaderStatus === LeaderStatus.APPROVED;

  switch (role) {
    case UserRole.ADMIN:
      return {
        navItems: [
          { to: ROUTES.ADMIN_DASHBOARD, label: t('navigation.adminDashboard') },
          { to: ROUTES.ADMIN_REVIEW, label: t('navigation.reviewApplications') },
          { to: ROUTES.ADMIN_ROLES, label: t('navigation.manageRoles') },
        ],
        greeting: t('roles.admin'),
        label: t('roles.admin'),
      };
    case UserRole.SESSION_LEADER:
      return {
        navItems: [
          { to: ROUTES.ADMIN_DASHBOARD, label: t('navigation.adminDashboard') },
          { to: ROUTES.ADMIN_REVIEW, label: t('navigation.reviewApplications') },
        ],
        greeting: t('roles.sessionLeader'),
        label: isApprovedLeader
          ? t('roles.sessionLeader')
          : t('roles.sessionLeader') + ' (Pending)',
      };
    case UserRole.BISHOP:
      return {
        navItems: isApprovedLeader
          ? [
              { to: ROUTES.LEADER_DASHBOARD, label: t('navigation.leaderDashboard') },
              { to: ROUTES.LEADER_RECOMMENDATIONS, label: t('navigation.recommendations') },
            ]
          : [
              { to: ROUTES.LEADER_PENDING, label: t('navigation.leaderAccess') },
              { to: ROUTES.LEADER_RECOMMENDATIONS, label: t('navigation.recommendations') },
            ],
        greeting: t('roles.bishop'),
        label: isApprovedLeader
          ? t('roles.bishop')
          : t('roles.bishop') + ' (Pending)',
      };
    case UserRole.STAKE_PRESIDENT:
      return {
        navItems: isApprovedLeader
          ? [
              { to: ROUTES.LEADER_DASHBOARD, label: t('navigation.leaderDashboard') },
              { to: ROUTES.LEADER_RECOMMENDATIONS, label: t('navigation.recommendations') },
            ]
          : [
              { to: ROUTES.LEADER_PENDING, label: t('navigation.leaderAccess') },
              { to: ROUTES.LEADER_RECOMMENDATIONS, label: t('navigation.recommendations') },
            ],
        greeting: t('roles.stakePresident'),
        label: isApprovedLeader
          ? t('roles.stakePresident')
          : t('roles.stakePresident') + ' (Pending)',
      };
    case UserRole.APPLICANT:
      return {
        navItems: [{ to: ROUTES.APPLICATION, label: t('navigation.application') }],
        greeting: t('roles.applicant'),
        label: t('roles.applicant'),
      };
    default:
      return {
        navItems: [],
        greeting: t('roles.user'),
        label: t('roles.user'),
      };
  }
};
