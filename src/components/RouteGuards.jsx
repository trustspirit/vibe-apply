import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

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
    return <Navigate to="/application" replace />;
  }

  return children;
};

export const PublicOnly = ({ children }) => {
  const { currentUser } = useApp();

  if (currentUser?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (currentUser) {
    return <Navigate to="/application" replace />;
  }

  return children;
};

export const RequireUser = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (currentUser.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
