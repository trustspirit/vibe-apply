import { useCallback } from 'react';
import type { Application } from '@vibe-apply/shared';
import { RecommendationStatus } from '@vibe-apply/shared';
import { CONFIRMATION_MESSAGES } from '@/utils/formConstants';
import type { UseRecommendationHandlersOptions } from '../types';

export const useRecommendationHandlers = ({
  leaderId,
  recommendations,
  combinedItems,
  form,
  validateForm,
  submitLeaderRecommendation,
  deleteLeaderRecommendation,
  refetchRecommendations,
  refetchApplications,
  setCurrentFormId,
  setSelectedId,
  setEditingOriginStatus,
  setErrors,
  setFormError,
  setFeedback,
  currentFormId,
  selectedId,
  t,
}: UseRecommendationHandlersOptions) => {
  const handleRecommendApplicant = useCallback(
    (application: Application) => {
      if (!leaderId) {
        return;
      }

      const normalizedEmail = application.email
        ? application.email.toLowerCase()
        : undefined;
      const normalizedName = application.name.trim().toLowerCase();
      const normalizedStake = application.stake.toLowerCase();
      const normalizedWard = application.ward.toLowerCase();

      const alreadyRecommendedById = recommendations.some(
        (rec) => rec.linkedApplicationId === application.id
      );

      const alreadyRecommendedByMatch = recommendations.some((rec) => {
        if (rec.leaderId !== leaderId) {
          return false;
        }
        const recName = rec.name.trim().toLowerCase();
        const recStake = rec.stake.toLowerCase();
        const recWard = rec.ward.toLowerCase();

        if (normalizedEmail) {
          const recEmail = rec.email ? rec.email.toLowerCase() : undefined;
          return (
            recEmail === normalizedEmail &&
            recName === normalizedName &&
            recStake === normalizedStake &&
            recWard === normalizedWard
          );
        } else {
          return (
            !rec.email &&
            recName === normalizedName &&
            recStake === normalizedStake &&
            recWard === normalizedWard
          );
        }
      });

      if (alreadyRecommendedById || alreadyRecommendedByMatch) {
        setFormError(t('leader.recommendations.messages.alreadyRecommended'));
        return;
      }

      const applicationItem = combinedItems.find(
        (item) =>
          'isApplication' in item &&
          item.isApplication &&
          item.id === application.id
      );

      if (
        applicationItem &&
        'hasRecommendation' in applicationItem &&
        applicationItem.hasRecommendation
      ) {
        setFormError(t('leader.recommendations.messages.alreadyRecommended'));
        return;
      }

      setFormError('');

      submitLeaderRecommendation(leaderId, {
        id: null,
        name: application.name,
        age: application.age ?? null,
        email: application.email,
        phone: application.phone,
        gender: application.gender ?? '',
        stake: application.stake,
        ward: application.ward,
        moreInfo: application.moreInfo ?? '',
        servedMission: application.servedMission,
        status: RecommendationStatus.SUBMITTED,
      })
        .then(async () => {
          setFormError('');
          setFeedback(
            t('leader.recommendations.messages.recommended', {
              name: application.name,
            })
          );

          await Promise.all([refetchRecommendations(), refetchApplications()]);

          setSelectedId(application.id);
        })
        .catch((error) => {
          setFormError(
            (error as Error).message ||
              t('leader.recommendations.messages.failedToRecommend')
          );
        });
    },
    [
      leaderId,
      combinedItems,
      recommendations,
      submitLeaderRecommendation,
      refetchRecommendations,
      refetchApplications,
      setFormError,
      setFeedback,
      setSelectedId,
      t,
    ]
  );

  const handleSubmitDraft = useCallback(
    (status: RecommendationStatus) => {
      if (!leaderId) {
        return;
      }

      const {
        nextErrors,
        normalizedAge,
        trimmedName,
        trimmedEmail,
        trimmedPhone,
        trimmedStake,
        trimmedWard,
        normalizedGender,
      } = validateForm();

      if (
        status === RecommendationStatus.SUBMITTED &&
        Object.keys(nextErrors).length
      ) {
        setErrors(nextErrors);
        setFormError(t('leader.recommendations.validation.resolveFields'));
        return;
      }

      setFormError('');

      submitLeaderRecommendation(leaderId, {
        id: form.id,
        name: trimmedName,
        age: Number.isNaN(normalizedAge) ? null : normalizedAge,
        email: trimmedEmail || undefined,
        phone: trimmedPhone,
        gender: normalizedGender || form.gender,
        stake: trimmedStake,
        ward: trimmedWard,
        moreInfo: form.moreInfo.trim(),
        servedMission: form.servedMission,
        status,
      })
        .then(() => {
          setFormError('');
          setFeedback(
            status === RecommendationStatus.SUBMITTED
              ? t('leader.recommendations.messages.submitted')
              : t('leader.recommendations.messages.draftSaved')
          );
          setCurrentFormId(undefined);
        })
        .catch((error) => {
          const errorMessage =
            (error as Error).message ||
            t('leader.recommendations.messages.failedToSave');
          setFormError(errorMessage);
          console.error('Failed to submit recommendation:', error);
        });
    },
    [
      leaderId,
      form,
      validateForm,
      submitLeaderRecommendation,
      setErrors,
      setFormError,
      setFeedback,
      setCurrentFormId,
      t,
    ]
  );

  const handleDelete = useCallback(
    (recommendationId: string) => {
      if (!leaderId) {
        return;
      }
      const recommendation = recommendations.find(
        (item) => item.id === recommendationId
      );
      if (!recommendation) {
        return;
      }
      if (
        recommendation.status === RecommendationStatus.APPROVED ||
        recommendation.status === RecommendationStatus.REJECTED
      ) {
        return;
      }
      const confirmed = window.confirm(
        CONFIRMATION_MESSAGES.DELETE_RECOMMENDATION
      );
      if (!confirmed) {
        return;
      }
      deleteLeaderRecommendation(leaderId, recommendationId)
        .then(() => {
          setFeedback(t('leader.recommendations.messages.removed'));
          if (currentFormId === recommendationId) {
            setCurrentFormId(undefined);
          }
          if (selectedId === recommendationId) {
            setSelectedId(null);
          }
        })
        .catch((error) => {
          setFormError(
            (error as Error).message ||
              t('leader.recommendations.messages.failedToDelete')
          );
        });
    },
    [
      leaderId,
      recommendations,
      deleteLeaderRecommendation,
      currentFormId,
      selectedId,
      setFeedback,
      setFormError,
      setCurrentFormId,
      setSelectedId,
      t,
    ]
  );

  const handleQuickSubmit = useCallback(
    (recommendationId: string) => {
      if (!leaderId) {
        return;
      }
      const recommendation = recommendations.find(
        (item) => item.id === recommendationId
      );
      if (!recommendation) {
        return;
      }
      submitLeaderRecommendation(leaderId, {
        id: recommendation.id,
        name: recommendation.name,
        age: recommendation.age ?? null,
        email: recommendation.email || undefined,
        phone: recommendation.phone,
        gender: recommendation.gender ?? '',
        stake: recommendation.stake,
        ward: recommendation.ward,
        moreInfo: recommendation.moreInfo ?? '',
        servedMission: recommendation.servedMission,
        status: RecommendationStatus.SUBMITTED,
      })
        .then(() => {
          setFeedback(t('leader.recommendations.messages.submitted'));
          setSelectedId(recommendationId);
        })
        .catch((error) => {
          setFormError(
            (error as Error).message ||
              t('leader.recommendations.messages.failedToSubmit')
          );
        });
    },
    [
      leaderId,
      recommendations,
      submitLeaderRecommendation,
      setFeedback,
      setFormError,
      setSelectedId,
      t,
    ]
  );

  const handleCancelSubmission = useCallback(
    (recommendationId: string) => {
      if (!leaderId) {
        return;
      }
      const recommendation = recommendations.find(
        (item) => item.id === recommendationId
      );
      if (!recommendation) {
        return;
      }
      if (
        recommendation.status === RecommendationStatus.APPROVED ||
        recommendation.status === RecommendationStatus.REJECTED
      ) {
        return;
      }
      const confirmed = window.confirm(CONFIRMATION_MESSAGES.CANCEL_SUBMISSION);
      if (!confirmed) {
        return;
      }
      submitLeaderRecommendation(leaderId, {
        id: recommendation.id,
        name: recommendation.name,
        age: recommendation.age ?? null,
        email: recommendation.email || undefined,
        phone: recommendation.phone,
        gender: recommendation.gender ?? '',
        stake: recommendation.stake,
        ward: recommendation.ward,
        moreInfo: recommendation.moreInfo ?? '',
        servedMission: recommendation.servedMission,
        status: RecommendationStatus.DRAFT,
      })
        .then(() => {
          setFeedback(t('leader.recommendations.messages.movedToDraft'));
          setSelectedId(recommendationId);
        })
        .catch((error) => {
          setFormError(
            (error as Error).message ||
              t('leader.recommendations.messages.failedToCancel')
          );
        });
    },
    [
      leaderId,
      recommendations,
      submitLeaderRecommendation,
      setFeedback,
      setFormError,
      setSelectedId,
      t,
    ]
  );

  const handleModify = useCallback(
    (recommendationId: string) => {
      const recommendation = recommendations.find(
        (item) => item.id === recommendationId
      );
      if (!recommendation || !leaderId) {
        return;
      }

      if (
        recommendation.status === RecommendationStatus.APPROVED ||
        recommendation.status === RecommendationStatus.REJECTED
      ) {
        return;
      }

      setEditingOriginStatus(recommendation.status);
      setCurrentFormId(recommendationId);
      setSelectedId(recommendationId);
    },
    [
      recommendations,
      leaderId,
      setEditingOriginStatus,
      setCurrentFormId,
      setSelectedId,
    ]
  );

  const handleCancelEdit = useCallback(() => {
    setCurrentFormId(undefined);
    setEditingOriginStatus(null);
  }, [setCurrentFormId, setEditingOriginStatus]);

  const handleSelect = useCallback(
    (recommendationId: string) => {
      setSelectedId(recommendationId);
    },
    [setSelectedId]
  );

  const handleCreate = useCallback(() => {
    setCurrentFormId(null);
    setSelectedId(null);
    setFeedback('');
  }, [setCurrentFormId, setSelectedId, setFeedback]);

  return {
    handleRecommendApplicant,
    handleSubmitDraft,
    handleDelete,
    handleQuickSubmit,
    handleCancelSubmission,
    handleModify,
    handleCancelEdit,
    handleSelect,
    handleCreate,
  };
};
