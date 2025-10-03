import { User } from '@vibe-apply/shared';
import { USER_ROLES, LEADER_STATUS, ROUTES } from './constants';

export const getDefaultPathForUser = (
  user: Omit<User, 'password'> | null
): string => {
  if (!user) {
    return ROUTES.SIGN_IN;
  }

  if (!user.role) {
    return ROUTES.COMPLETE_PROFILE;
  }

  if (user.role === USER_ROLES.ADMIN) {
    return ROUTES.ADMIN_DASHBOARD;
  }

  if (user.role === USER_ROLES.SESSION_LEADER) {
    return ROUTES.ADMIN_DASHBOARD;
  }

  if (user.role === USER_ROLES.BISHOP || user.role === USER_ROLES.STAKE_PRESIDENT) {
    return user.leaderStatus === LEADER_STATUS.APPROVED
      ? ROUTES.LEADER_DASHBOARD
      : ROUTES.LEADER_PENDING;
  }

  return ROUTES.APPLICATION;
};

export default getDefaultPathForUser;
