import { User } from '@vibe-apply/shared';
import { USER_ROLES, LEADER_STATUS, ROUTES } from './constants';

export const getDefaultPathForUser = (user: User | null): string => {
  if (!user) {
    return ROUTES.SIGN_IN;
  }

  if (!user.role) {
    return ROUTES.COMPLETE_PROFILE;
  }

  if (user.role === USER_ROLES.ADMIN) {
    return ROUTES.ADMIN_DASHBOARD;
  }

  if (user.role === USER_ROLES.LEADER) {
    return user.leaderStatus === LEADER_STATUS.APPROVED ? ROUTES.LEADER_DASHBOARD : ROUTES.LEADER_PENDING;
  }

  return ROUTES.APPLICATION;
};

export default getDefaultPathForUser;
