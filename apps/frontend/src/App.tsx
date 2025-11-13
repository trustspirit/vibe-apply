import { Navigate, Route, Routes } from 'react-router-dom';
import {
  RequireAdmin,
  RequireAuth,
  PublicOnly,
  RequireUser,
  RequireLeader,
  RequireIncompleteProfile,
} from '@/components/RouteGuards';
import AppLayout from '@/layouts/AppLayout';
import { useApp } from '@/context/AppContext';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import AdminReview from '@/pages/Admin/AdminReview';
import AdminRoles from '@/pages/Admin/AdminRoles';
import SignIn from '@/pages/Auth/SignIn';
import SignUp from '@/pages/Auth/SignUp';
import AuthCallback from '@/pages/Auth/AuthCallback';
import CompleteProfile from '@/pages/Auth/CompleteProfile';
import UserApplication from '@/pages/User/UserApplication';
import AccountSettings from '@/pages/User/AccountSettings';
import LeaderDashboard from '@/pages/Leader/LeaderDashboard';
import LeaderPending from '@/pages/Leader/LeaderPending';
import LeaderRecommendations from '@/pages/Leader/LeaderRecommendations';
import { getDefaultPathForUser } from '@/utils/navigation';
import { ROUTES } from '@/utils/constants';

const App = () => {
  const { currentUser, isInitializing } = useApp();

  const defaultAuthedPath = getDefaultPathForUser(currentUser);

  if (isInitializing) {
    return null;
  }

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
        <Route path={ROUTES.ACCOUNT_SETTINGS} element={<AccountSettings />} />
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
          <Navigate
            to={currentUser ? defaultAuthedPath : ROUTES.SIGN_IN}
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;
