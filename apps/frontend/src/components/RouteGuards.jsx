import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { getDefaultPathForUser } from '../utils/navigation.js';

export const RequireAuth = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
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
