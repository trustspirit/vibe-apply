import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDefaultPathForUser } from '../utils/navigation';
import { USER_ROLES, LEADER_STATUS, ROUTES } from '../utils/constants';
import { ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RouteGuardProps) => {
  const { currentUser, isInitializing } = useApp();
  const location = useLocation();

  if (isInitializing) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  if (!currentUser.role) {
    return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
  }

  return children;
};

export const RequireAdmin = ({ children }: RouteGuardProps) => {
  const { currentUser, isInitializing } = useApp();
  const location = useLocation();

  if (isInitializing) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  if (currentUser.role === USER_ROLES.ADMIN) {
    return children;
  }

  if (currentUser.role === USER_ROLES.SESSION_LEADER) {
    if (currentUser.leaderStatus !== LEADER_STATUS.APPROVED) {
      return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
    }
    return children;
  }

  return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
};

export const PublicOnly = ({ children }: RouteGuardProps) => {
  const { currentUser, isInitializing } = useApp();

  if (isInitializing) {
    return null;
  }

  if (currentUser) {
    if (!currentUser.role) {
      return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
    }
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};

export const RequireUser = ({ children }: RouteGuardProps) => {
  const { currentUser, isInitializing } = useApp();
  const location = useLocation();

  if (isInitializing) return null;

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  if (currentUser.role !== USER_ROLES.APPLICANT) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};

interface RequireLeaderProps extends RouteGuardProps {
  requireApproved?: boolean;
}

export const RequireLeader = ({
  children,
  requireApproved = false,
}: RequireLeaderProps) => {
  const { currentUser, isInitializing } = useApp();
  const location = useLocation();

  if (isInitializing) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  const isLeader =
    currentUser.role === USER_ROLES.BISHOP ||
    currentUser.role === USER_ROLES.STAKE_PRESIDENT ||
    currentUser.role === USER_ROLES.SESSION_LEADER;

  if (!isLeader) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  if (requireApproved && currentUser.leaderStatus !== LEADER_STATUS.APPROVED) {
    return <Navigate to={ROUTES.LEADER_PENDING} replace />;
  }

  return children;
};

export const RequireIncompleteProfile = ({ children }: RouteGuardProps) => {
  const { currentUser, isInitializing } = useApp();

  if (isInitializing) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  if (currentUser.role) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};
