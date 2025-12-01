/**
 * Application constants and configuration
 */

import {
  UserRole,
  LeaderStatus,
  ApplicationStatus,
  RecommendationStatus,
  Gender,
} from '@vibe-apply/shared';

// Re-export enums for convenience
export { UserRole, LeaderStatus, ApplicationStatus, RecommendationStatus, Gender };

// =============================================================================
// ROUTES
// =============================================================================

export const ROUTES = {
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  AUTH_CALLBACK: '/auth/callback',
  COMPLETE_PROFILE: '/auth/complete-profile',
  ADMIN_ROOT: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_REVIEW: '/admin/review',
  ADMIN_ROLES: '/admin/roles',
  LEADER_DASHBOARD: '/leader/dashboard',
  LEADER_RECOMMENDATIONS: '/leader/recommendations',
  LEADER_PENDING: '/leader/pending',
  APPLICATION: '/application',
  ACCOUNT_SETTINGS: '/settings',
} as const;

// =============================================================================
// TAB IDS
// =============================================================================

export const TAB_IDS = {
  ALL: 'all',
} as const;

export const ADMIN_REVIEW_TABS = {
  ALL: 'all',
  AWAITING: ApplicationStatus.AWAITING,
  APPROVED: ApplicationStatus.APPROVED,
  REJECTED: ApplicationStatus.REJECTED,
} as const;

export const RECOMMENDATION_TABS = {
  ALL: 'all',
  DRAFT: RecommendationStatus.DRAFT,
  SUBMITTED: RecommendationStatus.SUBMITTED,
  APPROVED: RecommendationStatus.APPROVED,
  REJECTED: RecommendationStatus.REJECTED,
} as const;

export const ACCOUNT_TABS = {
  SETTINGS: 'settings',
  APPROVALS: 'approvals',
  DELETE: 'delete',
} as const;

// =============================================================================
// ITEM TYPES
// =============================================================================

export const ITEM_TYPES = {
  APPLICATION: 'application',
  RECOMMENDATION: 'recommendation',
} as const;

export type ItemType = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];

// =============================================================================
// FOCUS TYPES
// =============================================================================

export const FOCUS_TYPES = {
  TODAY: 'today',
} as const;

// =============================================================================
// ROLE TONE HELPER
// =============================================================================

export type RoleTone = 'admin' | 'sessionLeader' | 'stakePresident' | 'bishop' | 'applicant';

const ROLE_TONE_MAP: Record<string, RoleTone> = {
  [UserRole.ADMIN]: 'admin',
  [UserRole.SESSION_LEADER]: 'sessionLeader',
  [UserRole.STAKE_PRESIDENT]: 'stakePresident',
  [UserRole.BISHOP]: 'bishop',
  [UserRole.APPLICANT]: 'applicant',
};

export const getRoleTone = (
  role: UserRole | string | null | undefined
): RoleTone => {
  return role ? ROLE_TONE_MAP[role] || 'applicant' : 'applicant';
};

// =============================================================================
// STATUS DISPLAY CONSTANTS (for StatusChip and UI components)
// =============================================================================

export const STATUS_TONES = {
  [ApplicationStatus.DRAFT]: 'draft',
  [ApplicationStatus.AWAITING]: 'awaiting',
  [RecommendationStatus.SUBMITTED]: 'awaiting',
  [ApplicationStatus.APPROVED]: 'approved',
  [ApplicationStatus.REJECTED]: 'rejected',
  reviewed: 'reviewed',
  pending: 'awaiting',
} as const;

export const STATUS_LABELS = {
  [ApplicationStatus.DRAFT]: 'Draft',
  [ApplicationStatus.AWAITING]: 'Awaiting',
  [RecommendationStatus.SUBMITTED]: 'Awaiting',
  [ApplicationStatus.APPROVED]: 'Approved',
  [ApplicationStatus.REJECTED]: 'Rejected',
  reviewed: 'Reviewed',
  pending: 'Pending',
} as const;

export type StatusToneKey = keyof typeof STATUS_TONES;
export type StatusToneValue =
  | 'draft'
  | 'awaiting'
  | 'approved'
  | 'rejected'
  | 'reviewed';

// =============================================================================
// VALID GENDERS (derived from Gender enum)
// =============================================================================

export const VALID_GENDERS = Object.values(Gender) as Gender[];
