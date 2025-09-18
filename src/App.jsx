import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireAuth, PublicOnly, RequireUser, RequireLeader } from './components/RouteGuards.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { useApp } from './context/AppContext.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminReview from './pages/Admin/AdminReview.jsx';
import AdminRoles from './pages/Admin/AdminRoles.jsx';
import SignIn from './pages/Auth/SignIn.jsx';
import SignUp from './pages/Auth/SignUp.jsx';
import UserApplication from './pages/User/UserApplication.jsx';
import LeaderDashboard from './pages/Leader/LeaderDashboard.jsx';
import LeaderPending from './pages/Leader/LeaderPending.jsx';
import { getDefaultPathForUser } from './utils/navigation.js';

const App = () => {
  const { currentUser } = useApp();

  const defaultAuthedPath = getDefaultPathForUser(currentUser);

  return (
    <Routes>
      <Route
        path="/signin"
        element={
          <PublicOnly>
            <SignIn />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <SignUp />
          </PublicOnly>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to={defaultAuthedPath} replace />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Navigate to="/admin/dashboard" replace />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/review"
          element={
            <RequireAdmin>
              <AdminReview />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RequireAdmin>
              <AdminRoles />
            </RequireAdmin>
          }
        />
        <Route
          path="/application"
          element={
            <RequireUser>
              <UserApplication />
            </RequireUser>
          }
        />
        <Route
          path="/leader/dashboard"
          element={
            <RequireLeader requireApproved>
              <LeaderDashboard />
            </RequireLeader>
          }
        />
        <Route
          path="/leader/pending"
          element={
            <RequireLeader>
              <LeaderPending />
            </RequireLeader>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? defaultAuthedPath : '/signin'} replace />} />
    </Routes>
  );
};

export default App;
