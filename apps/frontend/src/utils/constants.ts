export const USER_ROLES = {
  ADMIN: 'admin',
  SESSION_LEADER: 'session_leader',
  STAKE_PRESIDENT: 'stake_president',
  BISHOP: 'bishop',
  APPLICANT: 'applicant',
} as const;

export const LEADER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

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
