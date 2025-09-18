import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const APPLICATION_KEY = 'vibe-apply-applications';

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
};

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

const ApplicationContext = createContext(null);

const loadInitialApplications = () => readStorage(APPLICATION_KEY, []);

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState(loadInitialApplications);

  useEffect(() => {
    writeStorage(APPLICATION_KEY, applications);
  }, [applications]);

  const submitApplication = (userId, formValues) => {
    setApplications((prev) => {
      const existing = prev.find((app) => app.userId === userId);
      const timestamp = new Date().toISOString();
      if (existing) {
        if (existing.status === 'approved' || existing.status === 'rejected') {
          throw new Error('Cannot edit after review is complete');
        }
        const updated = {
          ...existing,
          ...formValues,
          status: 'awaiting',
          updatedAt: timestamp,
        };
        return prev.map((app) => (app.id === existing.id ? updated : app));
      }
      const created = {
        id: createId(),
        userId,
        ...formValues,
        status: 'awaiting',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return [...prev, created];
    });
  };

  const updateApplicationStatus = (applicationId, status) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? { ...app, status, updatedAt: new Date().toISOString() }
          : app,
      ),
    );
  };

  const getUserApplication = (userId) =>
    applications.find((application) => application.userId === userId) || null;

  const value = useMemo(
    () => ({
      applications,
      submitApplication,
      updateApplicationStatus,
      getUserApplication,
    }),
    [applications],
  );

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within ApplicationProvider');
  }
  return context;
};
