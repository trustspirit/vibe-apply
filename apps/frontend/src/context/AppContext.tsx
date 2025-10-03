import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  authApi,
  usersApi,
  applicationsApi,
  recommendationsApi,
  ApiError,
} from '../services/api';
import { USER_ROLES, LEADER_STATUS } from '../utils/constants';
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

interface AppState {
  users: UserWithoutPassword[];
  applications: Application[];
  leaderRecommendations: LeaderRecommendation[];
}

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
  ) => Promise<void>;
  updateLeaderRecommendationStatus: (
    recommendationId: string,
    status: RecommendationStatus
  ) => Promise<void>;
  deleteLeaderRecommendation: (
    leaderId: string,
    recommendationId: string
  ) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const normalizeUserRecord = (
  user: UserWithoutPassword | null
): UserWithoutPassword | null => {
  if (!user) {
    return user;
  }
  const normalizedRole: UserRole =
    user.role === (USER_ROLES.ADMIN as UserRole)
      ? (USER_ROLES.ADMIN as UserRole)
      : user.role === (USER_ROLES.LEADER as UserRole)
        ? (USER_ROLES.LEADER as UserRole)
        : (USER_ROLES.APPLICANT as UserRole);
  const leaderStatus: LeaderStatus | null =
    normalizedRole === (USER_ROLES.LEADER as UserRole)
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

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>({
    users: [],
    applications: [],
    leaderRecommendations: [],
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const hasInitializedAuth = useRef(false);
  const hasFetchedUsers = useRef(false);
  const hasFetchedApplications = useRef(false);
  const hasFetchedRecommendations = useRef(false);
  const hasFetchedMyApplication = useRef(false);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === currentUserId) ?? null,
    [currentUserId, state.users]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const isAuthCallback = window.location.pathname === '/auth/callback';

      if (!currentUserId && !isAuthCallback && !hasInitializedAuth.current) {
        hasInitializedAuth.current = true;
        try {
          setIsLoading(true);
          const user = await authApi.getCurrentUser();
          setCurrentUserId(user.id);
          setState((prev) => ({
            ...prev,
            users: prev.users.some((u) => u.id === user.id)
              ? prev.users.map((u) => (u.id === user.id ? user : u))
              : [...prev.users, user],
          }));
        } catch {
        } finally {
          setIsLoading(false);
          setIsInitializing(false);
        }
      } else if (currentUserId || isAuthCallback) {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [currentUserId]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (currentUser?.role === USER_ROLES.ADMIN && !hasFetchedUsers.current) {
        hasFetchedUsers.current = true;
        try {
          const users = await usersApi.getAll();
          setState((prev) => ({
            ...prev,
            users: users.map((u) => normalizeUserRecord(u)!),
          }));
        } catch (error) {
          console.warn('Failed to fetch all users:', error);
          hasFetchedUsers.current = false;
        }
      }
    };

    fetchAllUsers();
  }, [currentUser?.role]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (
        (currentUser?.role === USER_ROLES.ADMIN ||
          (currentUser?.role === USER_ROLES.LEADER &&
            currentUser?.leaderStatus === LEADER_STATUS.APPROVED)) &&
        !hasFetchedApplications.current
      ) {
        hasFetchedApplications.current = true;
        try {
          const applications = await applicationsApi.getAll();
          setState((prev) => ({
            ...prev,
            applications,
          }));
        } catch (error) {
          console.warn('Failed to fetch applications:', error);
          hasFetchedApplications.current = false;
        }
      }
    };

    fetchApplications();
  }, [currentUser?.role, currentUser?.leaderStatus]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (
        currentUser?.role === USER_ROLES.ADMIN &&
        !hasFetchedRecommendations.current
      ) {
        hasFetchedRecommendations.current = true;
        try {
          const recommendations = await recommendationsApi.getAll();
          setState((prev) => ({
            ...prev,
            leaderRecommendations: recommendations,
          }));
        } catch (error) {
          console.warn('Failed to fetch admin recommendations:', error);
          hasFetchedRecommendations.current = false;
        }
      } else if (
        currentUser?.role === USER_ROLES.LEADER &&
        currentUser?.leaderStatus === LEADER_STATUS.APPROVED &&
        !hasFetchedRecommendations.current
      ) {
        hasFetchedRecommendations.current = true;
        try {
          const recommendations =
            await recommendationsApi.getMyRecommendations();
          setState((prev) => ({
            ...prev,
            leaderRecommendations: recommendations,
          }));
        } catch (error) {
          console.warn('Failed to fetch leader recommendations:', error);
          hasFetchedRecommendations.current = false;
        }
      }
    };

    fetchRecommendations();
  }, [currentUser?.role, currentUser?.leaderStatus, currentUser?.id]);

  useEffect(() => {
    const fetchUserApplication = async () => {
      if (
        currentUser?.role === USER_ROLES.APPLICANT &&
        currentUser?.id &&
        !hasFetchedMyApplication.current
      ) {
        hasFetchedMyApplication.current = true;
        try {
          setIsLoadingApplications(true);
          const application = await applicationsApi.getMyApplication();
          setState((prev) => ({
            ...prev,
            applications: application ? [application] : [],
          }));
        } catch (error) {
          console.warn('Failed to fetch applicant application:', error);
          hasFetchedMyApplication.current = false;
        } finally {
          setIsLoadingApplications(false);
        }
      }
    };

    fetchUserApplication();
  }, [currentUser?.role, currentUser?.id]);

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
    }: SignUpData): Promise<UserWithoutPassword> => {
      try {
        setIsLoading(true);
        const user = await authApi.signUp({ name, email, password });

        setState((prev) => ({
          ...prev,
          users: [...prev.users, user],
        }));
        setCurrentUserId(user.id);

        // Reset fetch flags for new user session
        hasFetchedUsers.current = false;
        hasFetchedApplications.current = false;
        hasFetchedRecommendations.current = false;
        hasFetchedMyApplication.current = false;

        return user;
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

        setState((prev) => ({
          ...prev,
          users: prev.users.some((u) => u.id === user.id)
            ? prev.users.map((u) => (u.id === user.id ? user : u))
            : [...prev.users, user],
        }));
        setCurrentUserId(user.id);

        // Reset fetch flags for new user session
        hasFetchedUsers.current = false;
        hasFetchedApplications.current = false;
        hasFetchedRecommendations.current = false;
        hasFetchedMyApplication.current = false;

        return user;
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
    } catch (error) {
      console.warn('API signout failed:', error);
    }
    setCurrentUserId(null);

    // Reset all fetch flags for next login
    hasInitializedAuth.current = false;
    hasFetchedUsers.current = false;
    hasFetchedApplications.current = false;
    hasFetchedRecommendations.current = false;
    hasFetchedMyApplication.current = false;
  }, []);

  const setUser = useCallback((user: User | null) => {
    if (user) {
      setState((prev) => ({
        ...prev,
        users: prev.users.some((u) => u.id === user.id)
          ? prev.users.map((u) => (u.id === user.id ? user : u))
          : [...prev.users, user],
      }));
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(null);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    await usersApi.updateRole(userId, role);
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) => {
        if (user.id !== userId) {
          return user;
        }
        const normalizedRole = role as UserRole;
        const leaderStatus: LeaderStatus | null =
          normalizedRole === (USER_ROLES.LEADER as UserRole)
            ? (user.leaderStatus ?? (LEADER_STATUS.PENDING as LeaderStatus))
            : null;
        return {
          ...user,
          role: normalizedRole,
          leaderStatus,
        };
      }),
    }));
  }, []);

  const updateLeaderStatus = useCallback(
    async (userId: string, status: LeaderStatus) => {
      await usersApi.updateLeaderStatus(userId, status);
      setState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === userId
            ? {
                ...user,
                leaderStatus: status,
              }
            : user
        ),
      }));
    },
    []
  );

  const submitApplication = useCallback(
    async (userId: string, payload: ApplicationPayload) => {
      const { userId: _, ...payloadWithoutUserId } = payload;
      const application = await applicationsApi.submit(payloadWithoutUserId);
      setState((prev) => {
        const existing = prev.applications.find((app) => app.userId === userId);
        if (existing) {
          return {
            ...prev,
            applications: prev.applications.map((app) =>
              app.id === existing.id ? application : app
            ),
          };
        }
        return {
          ...prev,
          applications: [application, ...prev.applications],
        };
      });
    },
    []
  );

  const submitLeaderRecommendation = useCallback(
    async (leaderId: string, payload: RecommendationPayload) => {
      const { id, leaderId: _, ...formData } = payload;
      if (id) {
        const recommendation = await recommendationsApi.update(id, formData);
        setState((prev) => ({
          ...prev,
          leaderRecommendations: prev.leaderRecommendations.map((rec) =>
            rec.id === id ? recommendation : rec
          ),
        }));
      } else {
        const recommendation = await recommendationsApi.submit(formData);
        setState((prev) => ({
          ...prev,
          leaderRecommendations: [
            recommendation,
            ...prev.leaderRecommendations,
          ],
        }));
      }
    },
    []
  );

  const deleteLeaderRecommendation = useCallback(
    async (leaderId: string, recommendationId: string) => {
      await recommendationsApi.delete(recommendationId);
      setState((prev) => ({
        ...prev,
        leaderRecommendations: prev.leaderRecommendations.filter(
          (recommendation) => recommendation.id !== recommendationId
        ),
      }));
    },
    []
  );

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      await applicationsApi.updateStatus(applicationId, status);
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status,
                updatedAt: new Date().toISOString(),
              }
            : app
        ),
      }));
    },
    []
  );

  const updateLeaderRecommendationStatus = useCallback(
    async (recommendationId: string, status: RecommendationStatus) => {
      await recommendationsApi.updateStatus(recommendationId, status);
      setState((prev) => ({
        ...prev,
        leaderRecommendations: prev.leaderRecommendations.map(
          (recommendation) =>
            recommendation.id === recommendationId
              ? {
                  ...recommendation,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : recommendation
        ),
      }));
    },
    []
  );

  const value = useMemo(
    () => ({
      users: state.users,
      applications: state.applications,
      leaderRecommendations: state.leaderRecommendations,
      currentUser,
      isLoading,
      isInitializing,
      isLoadingApplications,
      signUp,
      signIn,
      signOut,
      setUser,
      updateUserRole,
      updateLeaderStatus,
      submitApplication,
      updateApplicationStatus,
      submitLeaderRecommendation,
      updateLeaderRecommendationStatus,
      deleteLeaderRecommendation,
    }),
    [
      state,
      currentUser,
      isLoading,
      isInitializing,
      isLoadingApplications,
      signIn,
      signUp,
      signOut,
      setUser,
      updateUserRole,
      updateLeaderStatus,
      submitApplication,
      updateApplicationStatus,
      submitLeaderRecommendation,
      updateLeaderRecommendationStatus,
      deleteLeaderRecommendation,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
