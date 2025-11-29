/**
 * AppContext - Compatibility wrapper for legacy code
 * This context combines all split contexts for backward compatibility
 * New code should use individual contexts: useAuth, useApplications, useRecommendations, useUsers
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { AppProviders } from './AppProviders';
import { useAuth } from './AuthContext';
import { useApplications } from './ApplicationsContext';
import { useRecommendations } from './RecommendationsContext';
import { useUsers } from './UsersContext';
import type {
  User,
  Application,
  LeaderRecommendation,
  UserRole,
  LeaderStatus,
  ApplicationStatus,
  RecommendationStatus,
} from '@vibe-apply/shared';

type UserWithoutPassword = Omit<User, 'password'>;

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface ApplicationPayload {
  userId?: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: string;
  moreInfo: string;
  servedMission?: boolean;
}

interface RecommendationPayload {
  id?: string;
  leaderId?: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: string;
  moreInfo: string;
  servedMission?: boolean;
  status?: RecommendationStatus;
}

interface AppContextValue {
  users: UserWithoutPassword[];
  applications: Application[];
  leaderRecommendations: LeaderRecommendation[];
  currentUser: UserWithoutPassword | null;
  isLoading: boolean;
  isInitializing: boolean;
  isLoadingApplications: boolean;
  signUp: (data: SignUpData) => Promise<UserWithoutPassword>;
  signIn: (data: SignInData) => Promise<UserWithoutPassword>;
  signOut: () => Promise<void>;
  setUser: (user: UserWithoutPassword | null) => void;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateLeaderStatus: (userId: string, status: LeaderStatus) => Promise<void>;
  submitApplication: (
    userId: string,
    payload: ApplicationPayload
  ) => Promise<void>;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationStatus
  ) => Promise<void>;
  submitLeaderRecommendation: (
    leaderId: string,
    payload: RecommendationPayload
  ) => Promise<LeaderRecommendation>;
  updateLeaderRecommendationStatus: (
    recommendationId: string,
    status: RecommendationStatus
  ) => Promise<void>;
  deleteLeaderRecommendation: (
    leaderId: string,
    recommendationId: string
  ) => Promise<void>;
  refetchApplications: () => Promise<void>;
  refetchRecommendations: () => Promise<void>;
  refetchUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppContextProviderProps {
  children: ReactNode;
}

/**
 * Internal provider that combines all contexts
 */
const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const auth = useAuth();
  const applications = useApplications();
  const recommendations = useRecommendations();
  const users = useUsers();

  const value = useMemo(
    () => ({
      // Auth
      currentUser: auth.currentUser,
      isLoading: auth.isLoading,
      isInitializing: auth.isInitializing,
      signUp: auth.signUp,
      signIn: auth.signIn,
      signOut: auth.signOut,
      setUser: auth.setUser,
      // Applications
      applications: applications.applications,
      isLoadingApplications: applications.isLoadingApplications,
      submitApplication: applications.submitApplication,
      updateApplicationStatus: applications.updateApplicationStatus,
      refetchApplications: applications.refetchApplications,
      // Recommendations
      leaderRecommendations: recommendations.leaderRecommendations,
      submitLeaderRecommendation: recommendations.submitLeaderRecommendation,
      updateLeaderRecommendationStatus: recommendations.updateLeaderRecommendationStatus,
      deleteLeaderRecommendation: recommendations.deleteLeaderRecommendation,
      refetchRecommendations: recommendations.refetchRecommendations,
      // Users
      users: users.users,
      updateUserRole: users.updateUserRole,
      updateLeaderStatus: users.updateLeaderStatus,
      refetchUsers: users.refetchUsers,
    }),
    [auth, applications, recommendations, users]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Legacy provider for backward compatibility
 * Wraps app with all split contexts and provides combined interface
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppProviders>
      <AppContextProvider>{children}</AppContextProvider>
    </AppProviders>
  );
};

/**
 * Legacy hook for backward compatibility
 * New code should use individual hooks instead
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
