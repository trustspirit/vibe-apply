import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { getDefaultPathForUser } from '../utils/navigation.js';

export const RequireAuth = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Check if user profile is incomplete (no role assigned)
  if (!currentUser.role) {
    return <Navigate to="/auth/complete-profile" replace />;
  }

  return children;
};

export const RequireAdmin = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};

export const PublicOnly = ({ children }) => {
  const { currentUser } = useApp();

  if (currentUser) {
    // If user has no role, let them through to complete profile
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
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (currentUser.role !== 'applicant') {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};

export const RequireLeader = ({ children, requireApproved = false }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (currentUser.role !== 'leader') {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  if (requireApproved && currentUser.leaderStatus !== 'approved') {
    return <Navigate to="/leader/pending" replace />;
  }

  return children;
};

export const RequireIncompleteProfile = ({ children }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  // If user already has a role, redirect to appropriate dashboard
  if (currentUser.role) {
    return <Navigate to={getDefaultPathForUser(currentUser)} replace />;
  }

  return children;
};
