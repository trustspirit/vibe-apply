import { Navigate, Route, Routes } from 'react-router-dom';
import {
  RequireAdmin,
  RequireAuth,
  PublicOnly,
  RequireUser,
  RequireLeader,
  RequireIncompleteProfile,
} from './components/RouteGuards.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { useApp } from './context/AppContext.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminReview from './pages/Admin/AdminReview.jsx';
import AdminRoles from './pages/Admin/AdminRoles.jsx';
import SignIn from './pages/Auth/SignIn.jsx';
import SignUp from './pages/Auth/SignUp.jsx';
import AuthCallback from './pages/Auth/AuthCallback.jsx';
import CompleteProfile from './pages/Auth/CompleteProfile.jsx';
import UserApplication from './pages/User/UserApplication.jsx';
import AccountSettings from './pages/User/AccountSettings.jsx';
import LeaderDashboard from './pages/Leader/LeaderDashboard.jsx';
import LeaderPending from './pages/Leader/LeaderPending.jsx';
import LeaderRecommendations from './pages/Leader/LeaderRecommendations.jsx';
import { getDefaultPathForUser } from './utils/navigation';
import { ROUTES } from './utils/constants';

const App = () => {
  const { currentUser } = useApp();

  const defaultAuthedPath = getDefaultPathForUser(currentUser);

  return (
    <Routes>
      <Route
        path={ROUTES.SIGN_IN}
        element={
          <PublicOnly>
            <SignIn />
          </PublicOnly>
        }
      />
      <Route
        path={ROUTES.SIGN_UP}
        element={
          <PublicOnly>
            <SignUp />
          </PublicOnly>
        }
      />
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
      <Route 
        path={ROUTES.COMPLETE_PROFILE} 
        element={
          <RequireIncompleteProfile>
            <CompleteProfile />
          </RequireIncompleteProfile>
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
          path={ROUTES.ADMIN_ROOT}
          element={
            <RequireAdmin>
              <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
            </RequireAdmin>
          }
        />
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path={ROUTES.ADMIN_REVIEW}
          element={
            <RequireAdmin>
              <AdminReview />
            </RequireAdmin>
          }
        />
        <Route
          path={ROUTES.ADMIN_ROLES}
          element={
            <RequireAdmin>
              <AdminRoles />
            </RequireAdmin>
          }
        />
        <Route
          path={ROUTES.APPLICATION}
          element={
            <RequireUser>
              <UserApplication />
            </RequireUser>
          }
        />
        <Route
          path={ROUTES.ACCOUNT_SETTINGS}
          element={<AccountSettings />}
        />
        <Route
          path={ROUTES.LEADER_DASHBOARD}
          element={
            <RequireLeader requireApproved>
              <LeaderDashboard />
            </RequireLeader>
          }
        />
        <Route
          path={ROUTES.LEADER_RECOMMENDATIONS}
          element={
            <RequireLeader>
              <LeaderRecommendations />
            </RequireLeader>
          }
        />
        <Route
          path={ROUTES.LEADER_PENDING}
          element={
            <RequireLeader>
              <LeaderPending />
            </RequireLeader>
          }
        />
      </Route>
      <Route
        path='*'
        element={
          <Navigate to={currentUser ? defaultAuthedPath : ROUTES.SIGN_IN} replace />
        }
      />
    </Routes>
  );
};

export default App;
