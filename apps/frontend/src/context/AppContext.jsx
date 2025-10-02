import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import {
  authApi,
  usersApi,
  applicationsApi,
  recommendationsApi,
  ApiError,
} from '../services/api.js';
import { USER_ROLES, LEADER_STATUS } from '../utils/constants.js';

const AppContext = createContext(null);

const normalizeUserRecord = (user) => {
  if (!user) {
    return user;
  }
  const normalizedRole =
    user.role === USER_ROLES.ADMIN
      ? USER_ROLES.ADMIN
      : user.role === USER_ROLES.LEADER
        ? USER_ROLES.LEADER
        : USER_ROLES.APPLICANT;
  const leaderStatus =
    normalizedRole === USER_ROLES.LEADER
      ? user.leaderStatus === LEADER_STATUS.APPROVED
        ? LEADER_STATUS.APPROVED
        : LEADER_STATUS.PENDING
      : null;

  return {
    ...user,
    role: normalizedRole,
    leaderStatus,
  };
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    users: [],
    applications: [],
    leaderRecommendations: [],
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === currentUserId) ?? null,
    [currentUserId, state.users]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const isAuthCallback = window.location.pathname === '/auth/callback';

      if (!currentUserId && !isAuthCallback) {
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
        } catch (error) {
          console.error('No valid session found:', error);
        } finally {
          setIsLoading(false);
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (currentUser?.role === USER_ROLES.ADMIN) {
        try {
          const users = await usersApi.getAll();
          setState((prev) => ({
            ...prev,
            users: users.map(normalizeUserRecord),
          }));
        } catch (error) {
          console.warn('Failed to fetch all users:', error);
        }
      }
    };

    fetchAllUsers();
  }, [currentUser?.role]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (currentUser?.role === USER_ROLES.ADMIN || (currentUser?.role === USER_ROLES.LEADER && currentUser?.leaderStatus === LEADER_STATUS.APPROVED)) {
        try {
          const applications = await applicationsApi.getAll();
          setState((prev) => ({
            ...prev,
            applications,
          }));
        } catch (error) {
          console.warn('Failed to fetch applications:', error);
        }
      }
    };

    fetchApplications();
  }, [currentUser?.role, currentUser?.leaderStatus]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (currentUser?.role === USER_ROLES.ADMIN) {
        try {
          const recommendations = await recommendationsApi.getAll();
          setState((prev) => ({
            ...prev,
            leaderRecommendations: recommendations,
          }));
        } catch (error) {
          console.warn('Failed to fetch admin recommendations:', error);
        }
      } else if (currentUser?.role === USER_ROLES.LEADER && currentUser?.leaderStatus === LEADER_STATUS.APPROVED) {
        try {
          const recommendations = await recommendationsApi.getMyRecommendations();
          setState((prev) => ({
            ...prev,
            leaderRecommendations: recommendations,
          }));
        } catch (error) {
          console.warn('Failed to fetch leader recommendations:', error);
        }
      }
    };

    fetchRecommendations();
  }, [currentUser?.role, currentUser?.leaderStatus, currentUser?.id]);

  useEffect(() => {
    const fetchUserApplication = async () => {
      if (currentUser?.role === USER_ROLES.APPLICANT && currentUser?.id) {
        try {
          setIsLoadingApplications(true);
          const application = await applicationsApi.getMyApplication();
          setState((prev) => ({
            ...prev,
            applications: application ? [application] : [],
          }));
        } catch (error) {
          console.warn('Failed to fetch applicant application:', error);
        } finally {
          setIsLoadingApplications(false);
        }
      }
    };

    fetchUserApplication();
  }, [currentUser?.role, currentUser?.id]);

  const signUp = useCallback(
    async ({ name, email, password }) => {
      try {
        setIsLoading(true);
        const user = await authApi.signUp({ name, email, password });

        setState((prev) => ({
          ...prev,
          users: [...prev.users, user],
        }));
        setCurrentUserId(user.id);

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
    async ({ email, password }) => {
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
  }, []);

  const setUser = useCallback((user) => {
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

  const updateUserRole = useCallback(async (userId, role) => {
    await usersApi.updateRole(userId, role);
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) => {
        if (user.id !== userId) {
          return user;
        }
        const normalizedRole =
          role === USER_ROLES.ADMIN
            ? USER_ROLES.ADMIN
            : role === USER_ROLES.LEADER
              ? USER_ROLES.LEADER
              : USER_ROLES.APPLICANT;
        const leaderStatus =
          normalizedRole === USER_ROLES.LEADER
            ? (user.leaderStatus ?? LEADER_STATUS.PENDING)
            : null;
        return {
          ...user,
          role: normalizedRole,
          leaderStatus,
        };
      }),
    }));
  }, []);

  const updateLeaderStatus = useCallback(async (userId, status) => {
    await usersApi.updateLeaderStatus(userId, status);
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              leaderStatus: status === 'approved' ? 'approved' : 'pending',
            }
          : user
      ),
    }));
  }, []);

  const submitApplication = useCallback(async (userId, payload) => {
    const application = await applicationsApi.submit({ ...payload, userId });
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
  }, []);

  const submitLeaderRecommendation = useCallback(async (leaderId, payload) => {
    const { id, ...formData } = payload;
    if (id) {
      const recommendation = await recommendationsApi.update(id, formData);
      setState((prev) => ({
        ...prev,
        leaderRecommendations: prev.leaderRecommendations.map((rec) =>
          rec.id === id ? recommendation : rec
        ),
      }));
    } else {
      const recommendation = await recommendationsApi.submit({
        ...formData,
        leaderId,
      });
      setState((prev) => ({
        ...prev,
        leaderRecommendations: [
          recommendation,
          ...prev.leaderRecommendations,
        ],
      }));
    }
  }, []);

  const deleteLeaderRecommendation = useCallback(
    async (leaderId, recommendationId) => {
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

  const updateApplicationStatus = useCallback(async (applicationId, status) => {
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
  }, []);

  const updateLeaderRecommendationStatus = useCallback(
    async (recommendationId, status) => {
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
