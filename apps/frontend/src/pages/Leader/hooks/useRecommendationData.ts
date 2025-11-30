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
    const stakeApplications = applications.filter(
      (app) => app.stake.toLowerCase() === currentUser?.stake.toLowerCase()
    );
    stakeApplications.forEach((app) => {
      applicationById.set(app.id, app);
    });

    const applicationsWithRecommendations = new Set<string>();

    recommendations.forEach((rec) => {
      if (rec.linkedApplicationId) {
        applicationsWithRecommendations.add(rec.linkedApplicationId);
      }

      const normalizedRecEmail = rec.email.toLowerCase();
      const normalizedRecName = rec.name.trim().toLowerCase();
      const normalizedRecStake = rec.stake.toLowerCase();
      const normalizedRecWard = rec.ward.toLowerCase();

      stakeApplications.forEach((app) => {
        const normalizedAppEmail = app.email.toLowerCase();
        const normalizedAppName = app.name.trim().toLowerCase();
        const normalizedAppStake = app.stake.toLowerCase();
        const normalizedAppWard = app.ward.toLowerCase();

        if (
          normalizedRecEmail === normalizedAppEmail &&
          normalizedRecName === normalizedAppName &&
          normalizedRecStake === normalizedAppStake &&
          normalizedRecWard === normalizedAppWard
        ) {
          applicationsWithRecommendations.add(app.id);
        }
      });
    });

    const mappedRecommendations: ExtendedRecommendation[] = recommendations.map(
      (rec: LeaderRecommendation) => {
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
            ? applicationById.has(rec.linkedApplicationId)
            : false,
          canEdit: canModify,
          canDelete: canModify,
        };
      }
    );

    const mappedApplications: ExtendedApplication[] = stakeApplications.map(
      (app) => ({
        ...app,
        isApplication: true,
        hasRecommendation: applicationsWithRecommendations.has(app.id),
      })
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
