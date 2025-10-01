import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { getDefaultPathForUser } from '../utils/navigation.js';
import { USER_ROLES, LEADER_STATUS, ROUTES } from '../utils/constants.js';

export const RequireAuth = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  if (!currentUser.role) {
    return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
  }

  return children;
};

export const RequireAdmin = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  if (currentUser.role !== USER_ROLES.ADMIN) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};

export const PublicOnly = ({ children }) => {
  const { currentUser } = useApp();

  if (currentUser) {
    if (!currentUser.role) {
      return children;
    }
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};

export const RequireUser = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  if (currentUser.role !== USER_ROLES.APPLICANT) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};

export const RequireLeader = ({ children, requireApproved = false }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  if (currentUser.role !== USER_ROLES.LEADER) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  if (requireApproved && currentUser.leaderStatus !== LEADER_STATUS.APPROVED) {
    return <Navigate to={ROUTES.LEADER_PENDING} replace />;
  }

  return children;
};

export const RequireIncompleteProfile = ({ children }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  if (currentUser.role) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};
