import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const USERS_KEY = 'vibe-apply-users';
const SESSION_KEY = 'vibe-apply-session';
const DEFAULT_ADMIN = {
  id: 'admin-default',
  name: 'Administrator',
  email: 'admin@example.com',
  password: 'Password123!',
  role: 'admin',
};

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
};

const AuthContext = createContext(null);

const readStorage = (key, fallback) => {
  if (typeof localStorage === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn('Failed to read storage', error);
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to write storage', error);
  }
};

const ensureAdmin = (users) => {
  const hasAdmin = users.some((user) => user.role === 'admin');
  if (hasAdmin) {
    return users;
  }
  return [...users, DEFAULT_ADMIN];
};

const loadInitialState = () => {
  const rawUsers = readStorage(USERS_KEY, []);
  const users = ensureAdmin(rawUsers);
  const session = readStorage(SESSION_KEY, null);
  if (!session) {
    return { users, currentUser: null };
  }
  const matchedUser = users.find((user) => user.id === session.userId);
  return {
    users,
    currentUser: matchedUser ? { ...matchedUser } : null,
  };
};

export const AuthProvider = ({ children }) => {
  const [{ users, currentUser }, setState] = useState(loadInitialState);

  useEffect(() => {
    writeStorage(USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      writeStorage(SESSION_KEY, { userId: currentUser.id });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUser]);

  const register = async ({ name, email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (users.some((user) => user.email === trimmedEmail)) {
      throw new Error('Email already in use');
    }
    const newUser = {
      id: createId(),
      name: name.trim(),
      email: trimmedEmail,
      password,
      role: 'user',
    };
    setState((prev) => ({
      users: [...prev.users, newUser],
      currentUser: newUser,
    }));
    return newUser;
  };

  const login = async ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const matchedUser = users.find(
      (user) => user.email === trimmedEmail && user.password === password,
    );
    if (!matchedUser) {
      throw new Error('Invalid credentials');
    }
    setState((prev) => ({
      ...prev,
      currentUser: matchedUser,
    }));
    return matchedUser;
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
    }));
  };

  const updateRole = (userId, nextRole) => {
    setState((prev) => {
      const updatedUsers = prev.users.map((user) =>
        user.id === userId ? { ...user, role: nextRole } : user,
      );
      const updatedCurrent =
        prev.currentUser && prev.currentUser.id === userId
          ? { ...prev.currentUser, role: nextRole }
          : prev.currentUser;
      return { users: updatedUsers, currentUser: updatedCurrent };
    });
  };

  const value = useMemo(
    () => ({
      user: currentUser,
      users,
      register,
      login,
      logout,
      updateRole,
    }),
    [currentUser, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
