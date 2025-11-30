import { useMemo } from 'react';
import type { Application, LeaderRecommendation } from '@vibe-apply/shared';
import { ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import { resetTimeToMidnight } from '@/utils/validationConstants';
import { normalizeRecommendationStatus } from '@/utils/statusHelpers';
import type { ReviewItem } from '@/types';
import type { UseAdminReviewDataOptions } from '../types';

export const useAdminReviewData = ({
  applications,
  leaderRecommendations,
  activeTab,
  showTodayOnly,
  todayTimestamp,
}: UseAdminReviewDataOptions) => {
  const reviewItems = useMemo(() => {
    const applicationById = new Map<string, Application>();
    applications.forEach((app) => {
      applicationById.set(app.id, app);
    });

    const recommendationsByLinkedAppId = new Map<
      string,
      LeaderRecommendation
    >();
    leaderRecommendations
      .filter((rec) => rec.status !== RecommendationStatus.DRAFT)
      .forEach((rec) => {
        if (rec.linkedApplicationId) {
          recommendationsByLinkedAppId.set(rec.linkedApplicationId, rec);
        }
      });

    const processedIds = new Set<string>();
    const items: ReviewItem[] = [];

    applications.forEach((app) => {
      if (processedIds.has(app.id)) {
        return;
      }
      processedIds.add(app.id);

      const recommendation = recommendationsByLinkedAppId.get(app.id);
      if (recommendation) {
        processedIds.add(recommendation.id);
      }

      items.push({
        key: `app-${app.id}`,
        type: 'application',
        entityId: app.id,
        status: app.status,
        rawStatus: app.status,
        name: app.name,
        email: app.email,
        phone: app.phone,
        age: app.age,
        gender: app.gender,
        stake: app.stake,
        ward: app.ward,
        moreInfo: app.moreInfo,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        hasRecommendation: !!recommendation,
        recommendationId: recommendation?.id,
      });
    });

    leaderRecommendations
      .filter((rec) => rec.status !== RecommendationStatus.DRAFT)
      .forEach((recommendation) => {
        if (processedIds.has(recommendation.id)) {
          return;
        }
        processedIds.add(recommendation.id);

        const mappedStatus = normalizeRecommendationStatus(
          recommendation.status
        );

        const linkedApp = recommendation.linkedApplicationId
          ? applicationById.get(recommendation.linkedApplicationId)
          : null;

        items.push({
          key: `rec-${recommendation.id}`,
          type: 'recommendation',
          entityId: recommendation.id,
          status: mappedStatus,
          rawStatus: recommendation.status,
          name: recommendation.name,
          email: recommendation.email,
          phone: recommendation.phone,
          age: recommendation.age,
          gender: recommendation.gender,
          stake: recommendation.stake,
          ward: recommendation.ward,
          moreInfo: recommendation.moreInfo,
          comments: recommendation.comments || [],
          createdAt: recommendation.createdAt,
          updatedAt: recommendation.updatedAt,
          hasApplication: !!linkedApp,
          applicationId: linkedApp?.id,
        });
      });

    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [applications, leaderRecommendations]);

  const approvedApplications = useMemo(
    () =>
      applications.filter((app) => app.status === ApplicationStatus.APPROVED),
    [applications]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: reviewItems.length,
      awaiting: 0,
      approved: 0,
      rejected: 0,
    };
    reviewItems.forEach((item) => {
      if (item.status === ApplicationStatus.AWAITING) {
        counts.awaiting += 1;
      }
      if (
        item.status === ApplicationStatus.APPROVED ||
        item.status === RecommendationStatus.APPROVED
      ) {
        counts.approved += 1;
      }
      if (
        item.status === ApplicationStatus.REJECTED ||
        item.status === RecommendationStatus.REJECTED
      ) {
        counts.rejected += 1;
      }
    });
    return counts;
  }, [reviewItems]);

  const filteredItems = useMemo(() => {
    let items =
      activeTab === 'all'
        ? reviewItems
        : reviewItems.filter((item) => item.status === activeTab);
    if (showTodayOnly) {
      items = items.filter((item) => {
        const created = resetTimeToMidnight(new Date(item.createdAt));
        return created.getTime() === todayTimestamp;
      });
    }
    return items;
  }, [reviewItems, activeTab, showTodayOnly, todayTimestamp]);

  return {
    reviewItems,
    approvedApplications,
    statusCounts,
    filteredItems,
  };
};

