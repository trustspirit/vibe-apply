import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { ApplicationStatus } from '@vibe-apply/shared';
import { remapStatusForRecommendation } from '@/utils/statusHelpers';
import { exportApprovedApplicationsToCSV } from '@/utils/exportData';
import type { ReviewItem } from '@/types';
import type { UseAdminReviewHandlersOptions } from '../types';

export const useAdminReviewHandlers = ({
  reviewItems,
  selectedItem,
  updateApplicationStatus,
  updateLeaderRecommendationStatus,
  setStatusSelection,
  setSelectedId,
  approvedApplications,
}: UseAdminReviewHandlersOptions) => {
  const handleStatusSelect = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      if (!selectedItem) {
        return;
      }
      const nextStatus = event.target.value;
      setStatusSelection(nextStatus);
      try {
        if (selectedItem.type === 'application') {
          await updateApplicationStatus(
            selectedItem.entityId,
            nextStatus as ApplicationStatus
          );
        } else {
          await updateLeaderRecommendationStatus(
            selectedItem.entityId,
            remapStatusForRecommendation(nextStatus)
          );
        }
      } catch (error) {
        setStatusSelection(selectedItem.status);
        void error;
      }
    },
    [
      selectedItem,
      updateApplicationStatus,
      updateLeaderRecommendationStatus,
      setStatusSelection,
    ]
  );

  const handleTabClick = useCallback(
    (
      tabId: string,
      setActiveTab: (tab: string) => void,
      setShowTodayOnly: (show: boolean) => void
    ) => {
      setActiveTab(tabId);
      setShowTodayOnly(false);
    },
    []
  );

  const handleInlineStatusChange = useCallback(
    async (
      entryKey: string,
      status: string,
      currentSelectedItem: ReviewItem | null
    ) => {
      if (!status) {
        return;
      }
      const item = reviewItems.find((entry) => entry.key === entryKey);
      if (!item) {
        return;
      }

      try {
        if (item.type === 'application') {
          await updateApplicationStatus(
            item.entityId,
            status as ApplicationStatus
          );
        } else {
          await updateLeaderRecommendationStatus(
            item.entityId,
            remapStatusForRecommendation(status)
          );
        }

        if (currentSelectedItem?.key === entryKey) {
          setStatusSelection(status);
        }
        setSelectedId(entryKey);
      } catch (error) {
        void error;
      }
    },
    [
      reviewItems,
      updateApplicationStatus,
      updateLeaderRecommendationStatus,
      setStatusSelection,
      setSelectedId,
    ]
  );

  const handleExportApproved = useCallback(() => {
    exportApprovedApplicationsToCSV(approvedApplications);
  }, [approvedApplications]);

  return {
    handleStatusSelect,
    handleTabClick,
    handleInlineStatusChange,
    handleExportApproved,
  };
};

