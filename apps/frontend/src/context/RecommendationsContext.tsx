/**
 * RecommendationsContext - Handles leader recommendation data and operations
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
import { recommendationsApi } from '@/services/api';
import { useAuth } from './AuthContext';
import type { LeaderRecommendation, RecommendationStatus } from '@vibe-apply/shared';
import { isApprovedLeader, isLeaderRole } from '@vibe-apply/shared';
import { USER_ROLES } from '@/utils/constants';

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

interface RecommendationsContextValue {
  leaderRecommendations: LeaderRecommendation[];
  submitLeaderRecommendation: (leaderId: string, payload: RecommendationPayload) => Promise<LeaderRecommendation>;
  updateLeaderRecommendationStatus: (recommendationId: string, status: RecommendationStatus) => Promise<void>;
  deleteLeaderRecommendation: (leaderId: string, recommendationId: string) => Promise<void>;
  refetchRecommendations: () => Promise<void>;
}

const RecommendationsContext = createContext<RecommendationsContextValue | null>(null);

interface RecommendationsProviderProps {
  children: ReactNode;
}

export const RecommendationsProvider = ({ children }: RecommendationsProviderProps) => {
  const { currentUser } = useAuth();
  const [leaderRecommendations, setLeaderRecommendations] = useState<LeaderRecommendation[]>([]);
  const hasFetchedRecommendations = useRef(false);

  // Fetch recommendations based on user role
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentUser?.role || !currentUser?.id) {
        return;
      }

      const canViewAllRecommendations =
        currentUser.role === USER_ROLES.ADMIN ||
        isApprovedLeader(currentUser);

      const canViewOwnRecommendations = isLeaderRole(currentUser.role);

      if (
        (!canViewAllRecommendations && !canViewOwnRecommendations) ||
        hasFetchedRecommendations.current
      ) {
        return;
      }

      try {
        hasFetchedRecommendations.current = true;
        let fetchedRecommendations: LeaderRecommendation[] = [];

        if (canViewAllRecommendations) {
          fetchedRecommendations = await recommendationsApi.getAll();
        } else if (canViewOwnRecommendations) {
          fetchedRecommendations = await recommendationsApi.getByLeader(
            currentUser.id
          );
        }

        setLeaderRecommendations(fetchedRecommendations);
      } catch (error) {
        void error;
      }
    };

    fetchRecommendations();
  }, [currentUser?.role, currentUser?.id]);

  const submitLeaderRecommendation = useCallback(
    async (leaderId: string, payload: RecommendationPayload): Promise<LeaderRecommendation> => {
      const { id, leaderId: payloadLeaderId, ...formData } = payload;
      void payloadLeaderId;
      if (id) {
        const recommendation = await recommendationsApi.update(id, formData);
        setLeaderRecommendations((prev) =>
          prev.map((rec) => (rec.id === id ? recommendation : rec))
        );
        return recommendation;
      } else {
        const recommendation = await recommendationsApi.submit(formData);
        setLeaderRecommendations((prev) => [recommendation, ...prev]);
        return recommendation;
      }
    },
    []
  );

  const deleteLeaderRecommendation = useCallback(
    async (leaderId: string, recommendationId: string) => {
      await recommendationsApi.delete(recommendationId);
      setLeaderRecommendations((prev) =>
        prev.filter((recommendation) => recommendation.id !== recommendationId)
      );
    },
    []
  );

  const updateLeaderRecommendationStatus = useCallback(
    async (recommendationId: string, status: RecommendationStatus) => {
      await recommendationsApi.updateStatus(recommendationId, status);
      setLeaderRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendationId
            ? {
                ...rec,
                status,
                updatedAt: new Date().toISOString(),
              }
            : rec
        )
      );
    },
    []
  );

  const refetchRecommendations = useCallback(async () => {
    if (!currentUser?.role || !currentUser?.id) {
      return;
    }

    const canViewAllRecommendations =
      currentUser.role === USER_ROLES.ADMIN ||
      isApprovedLeader(currentUser);

    const canViewOwnRecommendations = isLeaderRole(currentUser.role);

    try {
      let fetchedRecommendations: LeaderRecommendation[] = [];

      if (canViewAllRecommendations) {
        fetchedRecommendations = await recommendationsApi.getAll();
      } else if (canViewOwnRecommendations) {
        fetchedRecommendations = await recommendationsApi.getByLeader(
          currentUser.id
        );
      }

      setLeaderRecommendations(fetchedRecommendations);
    } catch (error) {
      void error;
    }
  }, [currentUser?.role, currentUser?.id]);

  // Reset when user changes
  useEffect(() => {
    if (!currentUser) {
      hasFetchedRecommendations.current = false;
      setLeaderRecommendations([]);
    }
  }, [currentUser]);

  const value = useMemo(
    () => ({
      leaderRecommendations,
      submitLeaderRecommendation,
      updateLeaderRecommendationStatus,
      deleteLeaderRecommendation,
      refetchRecommendations,
    }),
    [
      leaderRecommendations,
      submitLeaderRecommendation,
      updateLeaderRecommendationStatus,
      deleteLeaderRecommendation,
      refetchRecommendations,
    ]
  );

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
};

export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
};
