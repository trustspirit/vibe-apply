import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/application" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
