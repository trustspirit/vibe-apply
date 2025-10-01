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

const STORAGE_KEY = 'vibe-apply-app-state';
const SESSION_KEY = 'vibe-apply-session';

const defaultUsers = [
  {
    id: 'user-leader-approved',
    name: 'Leader Lydia',
    email: 'leader.lydia@example.com',
    password: 'leader123',
    role: USER_ROLES.LEADER,
    leaderStatus: LEADER_STATUS.APPROVED,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-applicant-1',
    name: 'Applicant Aaron',
    email: 'applicant.aaron@example.com',
    password: 'applicant123',
    role: USER_ROLES.APPLICANT,
    leaderStatus: null,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const defaultApplications = [
  {
    id: 'app-1',
    userId: 'seed-1',
    name: 'James Kim',
    age: 26,
    email: 'james.kim@example.com',
    phone: '555-2030',
    stake: 'North Stake',
    ward: 'Evergreen Ward',
    gender: 'male',
    moreInfo: 'Interested in volunteering for youth programs.',
    status: 'awaiting',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'app-2',
    userId: 'seed-2',
    name: 'Emily Park',
    age: 31,
    email: 'emily.park@example.com',
    phone: '555-2031',
    stake: 'Central Stake',
    ward: 'Riverside Ward',
    gender: 'female',
    moreInfo: 'Experienced in community outreach.',
    status: 'approved',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const defaultLeaderRecommendations = [
  {
    id: 'rec-1',
    leaderId: 'user-leader-approved',
    name: 'Alex Johnson',
    age: 24,
    email: 'alex.johnson@example.com',
    phone: '555-4030',
    stake: 'Central Stake',
    ward: 'Harbor Ward',
    gender: 'male',
    moreInfo: 'Strong background in youth mentorship.',
    status: 'submitted',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const defaultState = {
  users: defaultUsers,
  applications: defaultApplications,
  leaderRecommendations: defaultLeaderRecommendations,
};

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

const loadState = () => {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultState;
    }
    const parsed = JSON.parse(stored);
    return {
      users: Array.isArray(parsed.users)
        ? parsed.users.map(normalizeUserRecord)
        : defaultUsers,
      applications: Array.isArray(parsed.applications)
        ? parsed.applications
        : defaultApplications,
      leaderRecommendations: Array.isArray(parsed.leaderRecommendations)
        ? parsed.leaderRecommendations
        : defaultLeaderRecommendations,
    };
  } catch (error) {
    console.error('Failed to parse stored state', error);
    return defaultState;
  }
};

const loadSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to load session', error);
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(loadState);
  const [currentUserId, setCurrentUserId] = useState(loadSession);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === currentUserId) ?? null,
    [currentUserId, state.users]
  );

  // Check if user session exists via HTTP-only cookies on app start
  useEffect(() => {
    const initializeAuth = async () => {
      // Skip auth initialization if we're on the auth callback page
      const isAuthCallback = window.location.pathname === '/auth/callback';

      if (!currentUserId && !isAuthCallback) {
        try {
          setIsLoading(true);
          const user = await authApi.getCurrentUser();
          setCurrentUserId(user.id);
          // Update local state with current user
          setState((prev) => ({
            ...prev,
            users: prev.users.some((u) => u.id === user.id)
              ? prev.users.map((u) => (u.id === user.id ? user : u))
              : [...prev.users, user],
          }));
        } catch (error) {
          console.error('No valid session found:', error);
          localStorage.removeItem(SESSION_KEY);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, [currentUserId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (currentUserId) {
      window.localStorage.setItem(SESSION_KEY, currentUserId);
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUserId]);

  const signUp = useCallback(
    async ({ name, email, password }) => {
      try {
        setIsLoading(true);
        const user = await authApi.signUp({ name, email, password });

        // Update local state
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

        // Fallback to local signup if API fails
        console.warn('API signup failed, falling back to local:', error);
        setIsOnline(false);

        const trimmedEmail = email.trim().toLowerCase();
        if (
          state.users.some((user) => user.email.toLowerCase() === trimmedEmail)
        ) {
          throw new Error('Email already in use.');
        }

        const newUser = {
          id:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `user-${Date.now()}`,
          name: name.trim(),
          email: trimmedEmail,
          password,
          role: null,
          leaderStatus: null,
          ward: '',
          stake: '',
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          users: [...prev.users, newUser],
        }));
        setCurrentUserId(newUser.id);

        return newUser;
      } finally {
        setIsLoading(false);
      }
    },
    [state.users]
  );

  const signIn = useCallback(
    async ({ email, password }) => {
      try {
        setIsLoading(true);
        const user = await authApi.signIn({ email, password });

        // Update local state
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

        // Fallback to local signin if API fails
        console.warn('API signin failed, falling back to local:', error);
        setIsOnline(false);

        const trimmedEmail = email.trim().toLowerCase();
        const foundUser = state.users.find(
          (user) =>
            user.email.toLowerCase() === trimmedEmail &&
            user.password === password
        );

        if (!foundUser) {
          throw new Error('Invalid credentials.');
        }

        setCurrentUserId(foundUser.id);
        return foundUser;
      } finally {
        setIsLoading(false);
      }
    },
    [state.users]
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
    try {
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
    } catch (error) {
      console.warn('API updateUserRole failed, updating locally:', error);
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
    }
  }, []);

  const updateLeaderStatus = useCallback(async (userId, status) => {
    try {
      await usersApi.updateLeaderStatus(userId, status);
      // Update local state after successful API call
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
    } catch (error) {
      console.warn('API updateLeaderStatus failed, updating locally:', error);
      // Fallback to local update
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
    }
  }, []);

  const submitApplication = useCallback(async (userId, payload) => {
    try {
      const application = await applicationsApi.submit({ ...payload, userId });
      // Update local state after successful API call
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
    } catch (error) {
      console.warn('API submitApplication failed, updating locally:', error);
      // Fallback to local update
      setState((prev) => {
        const existing = prev.applications.find((app) => app.userId === userId);
        const timestamp = new Date().toISOString();
        const { status: requestedStatus, ...applicationData } = payload;
        const normalizedStatus =
          requestedStatus === 'draft' ? 'draft' : 'awaiting';

        if (existing) {
          const nextStatus =
            existing.status === 'approved' || existing.status === 'rejected'
              ? existing.status
              : normalizedStatus;

          const updated = {
            ...existing,
            ...applicationData,
            status: nextStatus,
            updatedAt: timestamp,
          };

          return {
            ...prev,
            applications: prev.applications.map((app) =>
              app.id === existing.id ? updated : app
            ),
          };
        }

        const newApplication = {
          id:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `app-${Date.now()}`,
          userId,
          ...applicationData,
          status: normalizedStatus,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        return {
          ...prev,
          applications: [newApplication, ...prev.applications],
        };
      });
    }
  }, []);

  const submitLeaderRecommendation = useCallback(async (leaderId, payload) => {
    try {
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
    } catch (error) {
      console.warn(
        'API submitLeaderRecommendation failed, updating locally:',
        error
      );
      // Fallback to local update (original logic)
      setState((prev) => {
        const timestamp = new Date().toISOString();
        const { id, status, ...formData } = payload;
        const normalizedStatus = status === 'submitted' ? 'submitted' : 'draft';

        if (id) {
          return {
            ...prev,
            leaderRecommendations: prev.leaderRecommendations.map(
              (recommendation) =>
                recommendation.id === id
                  ? {
                      ...recommendation,
                      ...formData,
                      status: normalizedStatus,
                      updatedAt: timestamp,
                    }
                  : recommendation
            ),
          };
        }

        const newRecommendation = {
          id:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `rec-${Date.now()}`,
          leaderId,
          ...formData,
          status: normalizedStatus,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        return {
          ...prev,
          leaderRecommendations: [
            newRecommendation,
            ...prev.leaderRecommendations,
          ],
        };
      });
    }
  }, []);

  const deleteLeaderRecommendation = useCallback(
    async (leaderId, recommendationId) => {
      try {
        await recommendationsApi.delete(recommendationId);
        setState((prev) => ({
          ...prev,
          leaderRecommendations: prev.leaderRecommendations.filter(
            (recommendation) => recommendation.id !== recommendationId
          ),
        }));
      } catch (error) {
        console.warn(
          'API deleteLeaderRecommendation failed, updating locally:',
          error
        );
        // Fallback to local delete
        setState((prev) => ({
          ...prev,
          leaderRecommendations: prev.leaderRecommendations.filter(
            (recommendation) =>
              !(
                recommendation.id === recommendationId &&
                recommendation.leaderId === leaderId
              )
          ),
        }));
      }
    },
    []
  );

  const updateApplicationStatus = useCallback(async (applicationId, status) => {
    try {
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
    } catch (error) {
      console.warn(
        'API updateApplicationStatus failed, updating locally:',
        error
      );
      // Fallback to local update
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
    }
  }, []);

  const updateLeaderRecommendationStatus = useCallback(
    async (recommendationId, status) => {
      try {
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
      } catch (error) {
        console.warn(
          'API updateLeaderRecommendationStatus failed, updating locally:',
          error
        );
        // Fallback to local update
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
      }
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
      isOnline,
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
      isOnline,
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
