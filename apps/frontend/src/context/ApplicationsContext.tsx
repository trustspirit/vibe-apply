/**
 * ApplicationsContext - Handles application data and operations
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { applicationsApi } from '@/services/api';
import { useAuth } from './AuthContext';
import type { Application, ApplicationStatus } from '@vibe-apply/shared';
import { isApprovedLeader, UserRole } from '@vibe-apply/shared';

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

interface ApplicationsContextValue {
  applications: Application[];
  isLoadingApplications: boolean;
  submitApplication: (userId: string, payload: ApplicationPayload) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  refetchApplications: () => Promise<void>;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

interface ApplicationsProviderProps {
  children: ReactNode;
}

export const ApplicationsProvider = ({ children }: ApplicationsProviderProps) => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const hasFetchedApplications = useRef(false);
  const hasFetchedMyApplication = useRef(false);

  // Fetch all applications for admin/session leader
  useEffect(() => {
    const fetchAllApplications = async () => {
      if (!currentUser?.role) {
        return;
      }

      const canViewAllApplications =
        currentUser.role === UserRole.ADMIN ||
        isApprovedLeader(currentUser);

      if (!canViewAllApplications || hasFetchedApplications.current) {
        return;
      }

      try {
        hasFetchedApplications.current = true;
        const fetchedApplications = await applicationsApi.getAll();
        setApplications(fetchedApplications);
      } catch (error) {
        void error;
      }
    };

    fetchAllApplications();
  }, [currentUser]);

  // Fetch user's own application for applicant role
  useEffect(() => {
    const fetchUserApplication = async () => {
      if (!currentUser?.id || !currentUser?.role) {
        return;
      }

      if (
        currentUser.role !== UserRole.APPLICANT ||
        hasFetchedMyApplication.current
      ) {
        return;
      }

      try {
        setIsLoadingApplications(true);
        hasFetchedMyApplication.current = true;
        const application = await applicationsApi.getMyApplication();
        if (application) {
          setApplications([application]);
        }
      } catch (error) {
        void error;
      } finally {
        setIsLoadingApplications(false);
      }
    };

    fetchUserApplication();
  }, [currentUser]);

  const submitApplication = useCallback(
    async (userId: string, payload: ApplicationPayload) => {
      const { userId: payloadUserId, ...payloadWithoutUserId } = payload;
      void payloadUserId;
      const application = await applicationsApi.submit(payloadWithoutUserId);
      setApplications((prev) => {
        const existing = prev.find((app) => app.userId === userId);
        if (existing) {
          return prev.map((app) => (app.id === existing.id ? application : app));
        }
        return [application, ...prev];
      });
    },
    []
  );

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      await applicationsApi.updateStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status,
                updatedAt: new Date().toISOString(),
              }
            : app
        )
      );
    },
    []
  );

  const refetchApplications = useCallback(async () => {
    if (!currentUser?.role) {
      return;
    }

    const canViewAllApplications =
      currentUser.role === UserRole.ADMIN || isApprovedLeader(currentUser);

    if (canViewAllApplications) {
      try {
        const fetchedApplications = await applicationsApi.getAll();
        setApplications(fetchedApplications);
      } catch (error) {
        void error;
      }
    } else if (currentUser.role === UserRole.APPLICANT && currentUser.id) {
      try {
        const application = await applicationsApi.getMyApplication();
        if (application) {
          setApplications([application]);
        }
      } catch (error) {
        void error;
      }
    }
  }, [currentUser]);

  // Reset fetch flags when user changes
  useEffect(() => {
    if (!currentUser) {
      hasFetchedApplications.current = false;
      hasFetchedMyApplication.current = false;
      setApplications([]);
    }
  }, [currentUser]);

  const value = useMemo(
    () => ({
      applications,
      isLoadingApplications,
      submitApplication,
      updateApplicationStatus,
      refetchApplications,
    }),
    [applications, isLoadingApplications, submitApplication, updateApplicationStatus, refetchApplications]
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
};
