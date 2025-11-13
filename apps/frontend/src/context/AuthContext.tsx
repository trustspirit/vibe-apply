/**
 * AuthContext - Handles user authentication and session management
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { authApi, ApiError } from '@/services/api';
import { USER_ROLES, LEADER_STATUS } from '@/utils/constants';
import type { User, UserRole, LeaderStatus } from '@vibe-apply/shared';
import { normalizeUserRole, isLeaderRole } from '@vibe-apply/shared';

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

interface AuthContextValue {
  currentUser: UserWithoutPassword | null;
  isLoading: boolean;
  isInitializing: boolean;
  signUp: (data: SignUpData) => Promise<UserWithoutPassword>;
  signIn: (data: SignInData) => Promise<UserWithoutPassword>;
  signOut: () => Promise<void>;
  setUser: (user: UserWithoutPassword | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const normalizeUserRecord = (
  user: UserWithoutPassword | null
): UserWithoutPassword | null => {
  if (!user) {
    return user;
  }

  if (user.role === null) {
    return {
      ...user,
      role: null,
      leaderStatus: null,
    };
  }

  const normalizedRole: UserRole = normalizeUserRole(user.role);
  const leaderStatus: LeaderStatus | null = isLeaderRole(normalizedRole)
    ? user.leaderStatus === (LEADER_STATUS.APPROVED as LeaderStatus)
      ? (LEADER_STATUS.APPROVED as LeaderStatus)
      : (LEADER_STATUS.PENDING as LeaderStatus)
    : null;

  return {
    ...user,
    role: normalizedRole,
    leaderStatus,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(() => {
    return !!localStorage.getItem('vibe-apply-refresh-token');
  });
  const hasInitializedAuth = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (hasInitializedAuth.current) {
        return;
      }
      hasInitializedAuth.current = true;

      const isAuthCallback = window.location.pathname === '/auth/callback';

      if (isAuthCallback) {
        setIsInitializing(false);
        return;
      }

      const refreshToken = localStorage.getItem('vibe-apply-refresh-token');
      if (!refreshToken) {
        setIsInitializing(false);
        return;
      }

      try {
        await authApi.refreshAccessToken();
        const user = await authApi.getCurrentUser();
        const normalized = normalizeUserRecord(user);
        setCurrentUser(normalized);
      } catch (error) {
        localStorage.removeItem('vibe-apply-refresh-token');
        void error;
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
    }: SignUpData): Promise<UserWithoutPassword> => {
      try {
        setIsLoading(true);
        const user = await authApi.signUp({ name, email, password });
        const normalized = normalizeUserRecord(user);
        setCurrentUser(normalized);
        return normalized || user;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to sign up. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async ({ email, password }: SignInData): Promise<UserWithoutPassword> => {
      try {
        setIsLoading(true);
        const user = await authApi.signIn({ email, password });
        const normalized = normalizeUserRecord(user);
        setCurrentUser(normalized);
        return normalized || user;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to sign in. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
    } catch (signOutError) {
      void signOutError;
    }
    setCurrentUser(null);
    hasInitializedAuth.current = false;
  }, []);

  const setUser = useCallback((user: UserWithoutPassword | null) => {
    const normalized = normalizeUserRecord(user);
    setCurrentUser(normalized);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      isInitializing,
      signUp,
      signIn,
      signOut,
      setUser,
    }),
    [currentUser, isLoading, isInitializing, signUp, signIn, signOut, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
