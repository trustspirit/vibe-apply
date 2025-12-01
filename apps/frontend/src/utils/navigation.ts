import { User, isLeaderRole, isApprovedLeader, isAdmin, UserRole } from '@vibe-apply/shared';
import { ROUTES } from './constants';

export const getDefaultPathForUser = (
  user: Omit<User, 'password'> | null
): string => {
  if (!user) {
    return ROUTES.SIGN_IN;
  }

  if (!user.role) {
    return ROUTES.COMPLETE_PROFILE;
  }

  if (isAdmin(user.role)) {
    return ROUTES.ADMIN_DASHBOARD;
  }

  if (user.role === UserRole.SESSION_LEADER) {
    return isApprovedLeader(user)
      ? ROUTES.ADMIN_DASHBOARD
      : ROUTES.LEADER_PENDING;
  }

  if (isLeaderRole(user.role)) {
    return isApprovedLeader(user)
      ? ROUTES.LEADER_DASHBOARD
      : ROUTES.LEADER_PENDING;
  }

  return ROUTES.APPLICATION;
};

export default getDefaultPathForUser;
