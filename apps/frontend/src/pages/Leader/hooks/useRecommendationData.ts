import { useMemo } from 'react';
import type { Application, LeaderRecommendation } from '@vibe-apply/shared';
import { RecommendationStatus } from '@vibe-apply/shared';
import type {
  ExtendedRecommendation,
  ExtendedApplication,
  UseRecommendationDataOptions,
} from '../types';

export const useRecommendationData = ({
  recommendations,
  applications,
  currentUser,
  activeTab,
  selectedId,
  currentFormId,
}: UseRecommendationDataOptions) => {
  const combinedItems = useMemo(() => {
    const applicationById = new Map<string, Application>();
    const userStake = currentUser?.stake?.toLowerCase() || '';
    const stakeApplications = applications.filter(
      (app) => app.stake?.toLowerCase() === userStake
    );
    stakeApplications.forEach((app) => {
      applicationById.set(app.id, app);
    });

    const allApplicationsById = new Map<string, Application>();
    applications.forEach((app) => {
      allApplicationsById.set(app.id, app);
    });

    const applicationsWithRecommendations = new Set<string>();

    recommendations.forEach((rec) => {
      if (rec.linkedApplicationId) {
        const linkedApp = allApplicationsById.get(rec.linkedApplicationId);
        if (linkedApp && linkedApp.stake?.toLowerCase() === userStake) {
          applicationsWithRecommendations.add(rec.linkedApplicationId);
        }
      }
    });

    const mappedRecommendations: ExtendedRecommendation[] = recommendations
      .filter((rec: LeaderRecommendation) => {
        if (rec.linkedApplicationId) {
          const linkedApp = allApplicationsById.get(rec.linkedApplicationId);
          return !linkedApp || linkedApp.stake?.toLowerCase() !== userStake;
        }
        return true;
      })
      .map((rec: LeaderRecommendation) => {
        const isLinkedToApplication = !!rec.linkedApplicationId;
        const isOwner = rec.leaderId === currentUser?.id;
        const canModify =
          !isLinkedToApplication &&
          isOwner &&
          rec.status !== RecommendationStatus.APPROVED &&
          rec.status !== RecommendationStatus.REJECTED;
        return {
          ...rec,
          hasApplication: rec.linkedApplicationId
            ? allApplicationsById.has(rec.linkedApplicationId)
            : false,
          canEdit: canModify,
          canDelete: canModify,
        };
      });

    const mappedApplications: ExtendedApplication[] = stakeApplications.map(
      (app) => {
        const hasRecommendation =
          applicationsWithRecommendations.has(app.id) ||
          recommendations.some(
            (rec) =>
              rec.linkedApplicationId === app.id &&
              rec.stake?.toLowerCase() === userStake
          );
        return {
          ...app,
          isApplication: true,
          hasRecommendation,
        };
      }
    );

    return [...mappedRecommendations, ...mappedApplications].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [recommendations, applications, currentUser]);

  const filteredRecommendations = useMemo(() => {
    if (activeTab === 'all') {
      return combinedItems;
    }
    if (activeTab === 'submitted') {
      return combinedItems.filter((item) => {
        if ('isApplication' in item && item.isApplication) {
          return 'status' in item && item.status === 'awaiting';
        }
        return (
          'status' in item && item.status === RecommendationStatus.SUBMITTED
        );
      });
    }
    return combinedItems.filter(
      (item) =>
        !('isApplication' in item && item.isApplication) &&
        'status' in item &&
        item.status === activeTab
    );
  }, [combinedItems, activeTab]);

  const listRecommendations = filteredRecommendations;

  const shouldUpdateSelectedId = useMemo(() => {
    const containsPrevSelected = filteredRecommendations.some(
      (recommendation) => recommendation.id === selectedId
    );
    if (!containsPrevSelected) {
      return filteredRecommendations[0]?.id ?? null;
    }
    return null;
  }, [filteredRecommendations, selectedId]);

  const shouldUpdateCurrentFormId = useMemo(() => {
    if (
      currentFormId &&
      !filteredRecommendations.some(
        (recommendation) => recommendation.id === currentFormId
      )
    ) {
      return undefined;
    }
    return currentFormId;
  }, [filteredRecommendations, currentFormId]);

  const selectedItem = selectedId
    ? (combinedItems.find((item) => item.id === selectedId) ?? null)
    : null;

  const isEditing = currentFormId !== undefined;

  return {
    combinedItems,
    filteredRecommendations,
    listRecommendations,
    selectedItem,
    isEditing,
    shouldUpdateSelectedId,
    shouldUpdateCurrentFormId,
  };
};
