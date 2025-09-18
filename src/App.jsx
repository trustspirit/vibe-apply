import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ApplicationProvider } from './context/ApplicationContext.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import NotFound from './pages/NotFound.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ReviewApplications from './pages/admin/ReviewApplications.jsx';
import ManageRoles from './pages/admin/ManageRoles.jsx';
import UserApplication from './pages/user/UserApplication.jsx';

const HomeRedirect = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/application'} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<HomeRedirect />} />
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
      <Route element={<ProtectedRoute />}>
        <Route path="application" element={<UserApplication />} />
        <Route element={<AdminRoute />}>
          <Route path="admin/dashboard" element={<Dashboard />} />
          <Route path="admin/review" element={<ReviewApplications />} />
          <Route path="admin/manage-roles" element={<ManageRoles />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

const App = () => (
  <AuthProvider>
    <ApplicationProvider>
      <AppRoutes />
    </ApplicationProvider>
  </AuthProvider>
);

export default App;
