import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  RequireAdmin,
  RequireAuth,
  PublicOnly,
  RequireUser,
  RequireLeader,
  RequireIncompleteProfile,
} from '@/components';
import AppLayout from '@/layouts/AppLayout';
import { useApp } from '@/context/AppContext';
import { getDefaultPathForUser } from '@/utils/navigation';
import { ROUTES } from '@/utils/constants';

const AdminDashboard = lazy(() => import('@/pages/Admin/AdminDashboard'));
const AdminReview = lazy(() => import('@/pages/Admin/AdminReview'));
const AdminRoles = lazy(() => import('@/pages/Admin/AdminRoles'));
const SignIn = lazy(() => import('@/pages/Auth/SignIn'));
const SignUp = lazy(() => import('@/pages/Auth/SignUp'));
const AuthCallback = lazy(() => import('@/pages/Auth/AuthCallback'));
const CompleteProfile = lazy(() => import('@/pages/Auth/CompleteProfile'));
const UserApplication = lazy(() => import('@/pages/User/UserApplication'));
const AccountSettings = lazy(() => import('@/pages/User/AccountSettings'));
const LeaderDashboard = lazy(() => import('@/pages/Leader/LeaderDashboard'));
const LeaderPending = lazy(() => import('@/pages/Leader/LeaderPending'));
const LeaderRecommendations = lazy(
  () => import('@/pages/Leader/LeaderRecommendations')
);

const App = () => {
  const { currentUser, isInitializing } = useApp();

  const defaultAuthedPath = getDefaultPathForUser(currentUser);

  if (isInitializing) {
    return null;
  }

  return (
    <Suspense fallback={null}>
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
            <Navigate
              to={currentUser ? defaultAuthedPath : ROUTES.SIGN_IN}
              replace
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default App;
