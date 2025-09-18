import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'vibe-apply-app-state';
const SESSION_KEY = 'vibe-apply-session';

const defaultUsers = [
  {
    id: 'user-admin',
    name: 'System Admin',
    email: 'admin@vibeapply.com',
    password: 'admin123',
    role: 'admin',
    leaderStatus: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-leader-approved',
    name: 'Leader Lydia',
    email: 'leader.lydia@example.com',
    password: 'leader123',
    role: 'leader',
    leaderStatus: 'approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-applicant-1',
    name: 'Applicant Aaron',
    email: 'applicant.aaron@example.com',
    password: 'applicant123',
    role: 'applicant',
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
  {
    id: 'app-3',
    userId: 'seed-3',
    name: 'Oliver Choi',
    age: 22,
    email: 'oliver.choi@example.com',
    phone: '555-2032',
    stake: 'South Stake',
    ward: 'Harbor Ward',
    gender: 'male',
    moreInfo: 'Available for music and choir assignments.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'app-4',
    userId: 'seed-4',
    name: 'Sophia Lee',
    age: 29,
    email: 'sophia.lee@example.com',
    phone: '555-2033',
    stake: 'North Stake',
    ward: 'Willow Ward',
    gender: 'female',
    moreInfo: 'Skills in event coordination.',
    status: 'awaiting',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
  {
    id: 'rec-2',
    leaderId: 'user-leader-approved',
    name: 'Taylor Brooks',
    age: 28,
    email: 'taylor.brooks@example.com',
    phone: '555-4031',
    stake: 'South Stake',
    ward: 'Oak Ward',
    gender: 'female',
    moreInfo: 'Currently serving as Sunday School teacher.',
    status: 'draft',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
  const normalizedRole = user.role === 'admin' ? 'admin' : user.role === 'leader' ? 'leader' : 'applicant';
  const leaderStatus =
    normalizedRole === 'leader' ? (user.leaderStatus === 'approved' ? 'approved' : 'pending') : null;

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
      users: Array.isArray(parsed.users) ? parsed.users.map(normalizeUserRecord) : defaultUsers,
      applications: Array.isArray(parsed.applications) ? parsed.applications : defaultApplications,
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

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === currentUserId) ?? null,
    [currentUserId, state.users],
  );

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

  const signUp = ({ name, email, password, role }) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (state.users.some((user) => user.email.toLowerCase() === trimmedEmail)) {
      throw new Error('Email already in use.');
    }

    const normalizedRole = role === 'leader' ? 'leader' : 'applicant';
    const leaderStatus = normalizedRole === 'leader' ? 'pending' : null;

    const newUser = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password,
      role: normalizedRole,
      leaderStatus,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    setCurrentUserId(newUser.id);

    return newUser;
  };

  const signIn = ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = state.users.find(
      (user) => user.email.toLowerCase() === trimmedEmail && user.password === password,
    );

    if (!foundUser) {
      throw new Error('Invalid credentials.');
    }

    setCurrentUserId(foundUser.id);
    return foundUser;
  };

  const signOut = () => {
    setCurrentUserId(null);
  };

  const updateUserRole = (userId, role) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) => {
        if (user.id !== userId) {
          return user;
        }
        const normalizedRole = role === 'admin' ? 'admin' : role === 'leader' ? 'leader' : 'applicant';
        const leaderStatus =
          normalizedRole === 'leader'
            ? user.leaderStatus ?? 'pending'
            : null;
        return {
          ...user,
          role: normalizedRole,
          leaderStatus,
        };
      }),
    }));
  };

  const updateLeaderStatus = (userId, status) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === userId ? { ...user, leaderStatus: status === 'approved' ? 'approved' : 'pending' } : user,
      ),
    }));
  };

  const submitApplication = (userId, payload) => {
    setState((prev) => {
      const existing = prev.applications.find((app) => app.userId === userId);
      const timestamp = new Date().toISOString();
      const { status: requestedStatus, ...applicationData } = payload;
      const normalizedStatus = requestedStatus === 'draft' ? 'draft' : 'awaiting';

      if (existing) {
        const nextStatus =
          existing.status === 'approved' || existing.status === 'rejected' ? existing.status : normalizedStatus;

        const updated = {
          ...existing,
          ...applicationData,
          status: nextStatus,
          updatedAt: timestamp,
        };

        return {
          ...prev,
          applications: prev.applications.map((app) => (app.id === existing.id ? updated : app)),
        };
      }

      const newApplication = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`,
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
  };

  const submitLeaderRecommendation = (leaderId, payload) => {
    setState((prev) => {
      const timestamp = new Date().toISOString();
      const { id, status, ...formData } = payload;
      const normalizedStatus = status === 'submitted' ? 'submitted' : 'draft';

      if (id) {
        return {
          ...prev,
          leaderRecommendations: prev.leaderRecommendations.map((recommendation) =>
            recommendation.id === id
              ? {
                  ...recommendation,
                  ...formData,
                  status: normalizedStatus,
                  updatedAt: timestamp,
                }
              : recommendation,
          ),
        };
      }

      const newRecommendation = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`,
        leaderId,
        ...formData,
        status: normalizedStatus,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      return {
        ...prev,
        leaderRecommendations: [newRecommendation, ...prev.leaderRecommendations],
      };
    });
  };

  const deleteLeaderRecommendation = (leaderId, recommendationId) => {
    setState((prev) => ({
      ...prev,
      leaderRecommendations: prev.leaderRecommendations.filter(
        (recommendation) =>
          !(recommendation.id === recommendationId && recommendation.leaderId === leaderId),
      ),
    }));
  };

  const updateApplicationStatus = (applicationId, status) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status,
              updatedAt: new Date().toISOString(),
            }
          : app,
      ),
    }));
  };

  const updateLeaderRecommendationStatus = (recommendationId, status) => {
    setState((prev) => ({
      ...prev,
      leaderRecommendations: prev.leaderRecommendations.map((recommendation) =>
        recommendation.id === recommendationId
          ? {
              ...recommendation,
              status,
              updatedAt: new Date().toISOString(),
            }
          : recommendation,
      ),
    }));
  };

  const value = useMemo(
    () => ({
      users: state.users,
      applications: state.applications,
      leaderRecommendations: state.leaderRecommendations,
      currentUser,
      signUp,
      signIn,
      signOut,
      updateUserRole,
      updateLeaderStatus,
      submitApplication,
      updateApplicationStatus,
      submitLeaderRecommendation,
      updateLeaderRecommendationStatus,
      deleteLeaderRecommendation,
    }),
    [state, currentUser],
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
