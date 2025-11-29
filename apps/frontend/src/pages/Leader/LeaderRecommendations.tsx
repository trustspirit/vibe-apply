import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Application } from '@vibe-apply/shared';
import { ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { Button, Tabs } from '@/components/ui';
import { RecommendationForm } from './components/RecommendationForm';
import { RecommendationDetails } from './components/RecommendationDetails';
import { RecommendationMobileCard } from './components/RecommendationMobileCard';
import { RecommendationListItem } from './components/RecommendationListItem';
import {
  AGE_MIN,
  AGE_MAX,
  AGE_ERROR_MESSAGE,
} from '@/utils/validationConstants';
import { CONFIRMATION_MESSAGES } from '@/utils/formConstants';
import { USER_ROLES } from '@/utils/constants';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import type { TabItem } from '@/types';
import type {
  RecommendationFormData,
  ExtendedRecommendation,
  ExtendedApplication,
  ValidationErrors,
} from './types';
import styles from './LeaderRecommendations.module.scss';

interface LocationState {
  action?: string;
}

const emptyForm: RecommendationFormData = {
  id: null,
  name: '',
  age: '',
  email: '',
  phone: '',
  gender: '',
  stake: '',
  ward: '',
  moreInfo: '',
  servedMission: false,
};

const LeaderRecommendations = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const {
    currentUser,
    applications,
    leaderRecommendations,
    submitLeaderRecommendation,
    deleteLeaderRecommendation,
    refetchApplications,
    refetchRecommendations,
  } = useApp();
  const leaderId = currentUser?.id ?? null;

  const getStatusLabel = (
    status: string,
    isApplication: boolean
  ): string | undefined => {
    if (isApplication) {
      const appStatus = status as unknown as ApplicationStatus;
      if (appStatus === ApplicationStatus.REJECTED) {
        return t('leader.recommendations.tabs.rejected');
      }
      if (appStatus === ApplicationStatus.APPROVED) {
        return t('status.approved');
      }
      if (appStatus === ApplicationStatus.AWAITING) {
        return t('status.awaiting');
      }
      if (appStatus === ApplicationStatus.DRAFT) {
        return t('status.draft');
      }
    } else {
      const recStatus = status as unknown as RecommendationStatus;
      if (recStatus === RecommendationStatus.REJECTED) {
        return t('leader.recommendations.tabs.rejected');
      }
      if (recStatus === RecommendationStatus.APPROVED) {
        return t('status.approved');
      }
      if (recStatus === RecommendationStatus.SUBMITTED) {
        return t('status.submitted');
      }
      if (recStatus === RecommendationStatus.DRAFT) {
        return t('status.draft');
      }
    }
    return undefined;
  };

  const TAB_DEFS: TabItem[] = [
    { id: 'all', label: t('leader.recommendations.tabs.all') },
    { id: 'draft', label: t('leader.recommendations.tabs.draft') },
    { id: 'submitted', label: t('leader.recommendations.tabs.submitted') },
    { id: 'approved', label: t('leader.recommendations.tabs.approved') },
    { id: 'rejected', label: t('leader.recommendations.tabs.rejected') },
  ];

  useEffect(() => {
    refetchApplications();
    refetchRecommendations();
  }, [refetchApplications, refetchRecommendations]);

  const [activeTab, setActiveTab] = useState('all');
  const [currentFormId, setCurrentFormId] = useState<string | null | undefined>(
    undefined
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingOriginStatus, setEditingOriginStatus] =
    useState<RecommendationStatus | null>(null);
  const [form, setForm] = useState<RecommendationFormData>(emptyForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if ((state as LocationState)?.action === 'create') {
      setCurrentFormId(null);
      setSelectedId(null);
    }
  }, [state]);

  const recommendations = useMemo(() => {
    return leaderRecommendations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [leaderRecommendations]);

  const combinedItems = useMemo(() => {
    const applicationById = new Map<string, Application>();
    const stakeApplications = applications.filter(
      (app) => app.stake.toLowerCase() === currentUser?.stake.toLowerCase()
    );
    stakeApplications.forEach((app) => {
      applicationById.set(app.id, app);
    });

    // Create a map of applications that have recommendations
    // Check both by linkedApplicationId and by matching email/name/stake/ward
    const applicationsWithRecommendations = new Set<string>();

    recommendations.forEach((rec) => {
      // Add by linkedApplicationId if available
      if (rec.linkedApplicationId) {
        applicationsWithRecommendations.add(rec.linkedApplicationId);
      }

      // Also check by matching email/name/stake/ward for applications
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
      (rec) => {
        // If recommendation is linked to an application, it cannot be modified or deleted
        // because it was created from an existing application
        const isLinkedToApplication = !!rec.linkedApplicationId;
        // Only the leader who created the recommendation can modify it
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

    // Include all stake applications (both recommended and not recommended)
    // to show "Recommended" badge for recommended ones
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

  useEffect(() => {
    const containsPrevSelected = filteredRecommendations.some(
      (recommendation) => recommendation.id === selectedId
    );
    if (!containsPrevSelected) {
      const nextId = filteredRecommendations[0]?.id ?? null;
      setSelectedId(nextId);
    }

    if (
      currentFormId &&
      !filteredRecommendations.some(
        (recommendation) => recommendation.id === currentFormId
      )
    ) {
      setCurrentFormId(undefined);
    }
  }, [filteredRecommendations, selectedId, currentFormId]);

  const isEditing = currentFormId !== undefined;

  const selectedItem = selectedId
    ? (combinedItems.find((item) => item.id === selectedId) ?? null)
    : null;

  useEffect(() => {
    if (currentFormId === undefined) {
      setForm(emptyForm);
      setErrors({});
      setFormError('');
      setEditingOriginStatus(null);
      return;
    }

    if (currentFormId === null) {
      const initialWard =
        currentUser?.role === USER_ROLES.BISHOP ||
        currentUser?.role === USER_ROLES.APPLICANT
          ? currentUser?.ward || ''
          : '';
      setForm({
        ...emptyForm,
        stake: currentUser?.stake || '',
        ward: initialWard,
      });
      setErrors({});
      setFormError('');
      setEditingOriginStatus(null);
      return;
    }

    const recommendation = recommendations.find(
      (item) => item.id === currentFormId
    );
    if (recommendation) {
      setForm({
        id: recommendation.id,
        name: recommendation.name,
        age: recommendation.age?.toString() ?? '',
        email: recommendation.email,
        phone: recommendation.phone,
        gender: recommendation.gender ?? '',
        stake: recommendation.stake,
        ward: recommendation.ward,
        moreInfo: recommendation.moreInfo ?? '',
        servedMission: recommendation.servedMission ?? false,
      });
      setErrors({});
      setFormError('');
    } else {
      setCurrentFormId(undefined);
    }
  }, [currentFormId, recommendations, currentUser]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCreate = () => {
    setCurrentFormId(null);
    setSelectedId(null);
    setFeedback('');
  };

  const handleRecommendApplicant = (application: Application) => {
    if (!leaderId) {
      return;
    }

    // Check if already recommended by linkedApplicationId
    const alreadyRecommendedById = recommendations.some(
      (rec) => rec.linkedApplicationId === application.id
    );

    // Also check by email, name, stake, ward (in case linkedApplicationId is not set yet)
    const normalizedEmail = application.email.toLowerCase();
    const normalizedName = application.name.trim().toLowerCase();
    const normalizedStake = application.stake.toLowerCase();
    const normalizedWard = application.ward.toLowerCase();

    const alreadyRecommendedByMatch = recommendations.some((rec) => {
      const recEmail = rec.email.toLowerCase();
      const recName = rec.name.trim().toLowerCase();
      const recStake = rec.stake.toLowerCase();
      const recWard = rec.ward.toLowerCase();

      return (
        recEmail === normalizedEmail &&
        recName === normalizedName &&
        recStake === normalizedStake &&
        recWard === normalizedWard
      );
    });

    if (alreadyRecommendedById || alreadyRecommendedByMatch) {
      setFormError(t('leader.recommendations.messages.alreadyRecommended'));
      return;
    }

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
    })
      .then(async (recommendation) => {
        setFeedback(
          t('leader.recommendations.messages.recommended', {
            name: application.name,
          })
        );
        // submitLeaderRecommendation already updates local state with the new recommendation
        // The UI should update immediately because combinedItems will recalculate
        // with the new recommendation in the recommendations array
        // The matching logic in applicationsWithRecommendations will detect the new recommendation
        // by email/name/stake/ward even before linkedApplicationId is set

        // Select the newly created recommendation
        if (recommendation?.id) {
          setSelectedId(recommendation.id);
        }

        // Don't refetch recommendations immediately - it will overwrite the local state
        // and may not include the newly created recommendation or linkedApplicationId yet
        // Only refetch applications to ensure they're up to date
        await refetchApplications();

        // Optionally refetch recommendations after a delay to get linkedApplicationId
        // But only if the recommendation doesn't already have it
        if (!recommendation.linkedApplicationId) {
          setTimeout(async () => {
            try {
              await refetchRecommendations();
            } catch (error) {
              // Silently fail - local state already has the recommendation
              void error;
            }
          }, 3000);
        }

        // Refetch after a delay to get linkedApplicationId from backend
        // This ensures the link is properly established
        // Use a longer delay to ensure backend has processed the link
        setTimeout(async () => {
          try {
            await Promise.all([
              refetchRecommendations(),
              refetchApplications(),
            ]);
          } catch (error) {
            // Silently fail - local state already has the recommendation
            void error;
          }
        }, 2000);
      })
      .catch((error) => {
        setFormError(
          (error as Error).message ||
            t('leader.recommendations.messages.failedToRecommend')
        );
      });
  };

  const handleSelect = (recommendationId: string) => {
    setSelectedId(recommendationId);
  };

  const handleFormChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (formError) {
      setFormError('');
    }
  };

  const validateForm = () => {
    const nextErrors: ValidationErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedStake = form.stake.trim();
    const trimmedWard = form.ward.trim();
    const normalizedAge = Number.parseInt(form.age, 10);
    const normalizedGender =
      form.gender === 'male' || form.gender === 'female' ? form.gender : '';

    if (!trimmedName) {
      nextErrors.name = t('leader.recommendations.validation.nameRequired');
    }
    if (
      Number.isNaN(normalizedAge) ||
      normalizedAge < AGE_MIN ||
      normalizedAge > AGE_MAX
    ) {
      nextErrors.age = AGE_ERROR_MESSAGE;
    }
    if (!trimmedEmail) {
      nextErrors.email = t('leader.recommendations.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = t('leader.recommendations.validation.emailInvalid');
    }
    if (!trimmedPhone) {
      nextErrors.phone = t('leader.recommendations.validation.phoneRequired');
    }
    if (!trimmedStake) {
      nextErrors.stake = t('leader.recommendations.validation.stakeRequired');
    }
    if (!trimmedWard) {
      nextErrors.ward = t('leader.recommendations.validation.wardRequired');
    }

    return {
      nextErrors,
      normalizedAge,
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      trimmedStake,
      trimmedWard,
      normalizedGender,
    };
  };

  const handleSubmitDraft = (status: RecommendationStatus) => {
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

    submitLeaderRecommendation(leaderId, {
      id: form.id,
      name: trimmedName,
      age: Number.isNaN(normalizedAge) ? null : normalizedAge,
      email: trimmedEmail,
      phone: trimmedPhone,
      gender: normalizedGender || form.gender,
      stake: trimmedStake,
      ward: trimmedWard,
      moreInfo: form.moreInfo.trim(),
      servedMission: form.servedMission,
      status,
    })
      .then(() => {
        setFeedback(
          status === RecommendationStatus.SUBMITTED
            ? t('leader.recommendations.messages.submitted')
            : t('leader.recommendations.messages.draftSaved')
        );
        setCurrentFormId(undefined);
      })
      .catch((error) => {
        setFormError(
          (error as Error).message ||
            t('leader.recommendations.messages.failedToSave')
        );
      });
  };

  const handleDelete = (recommendationId: string) => {
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
  };

  const handleQuickSubmit = (recommendationId: string) => {
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
      email: recommendation.email,
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
  };

  const handleCancelSubmission = (recommendationId: string) => {
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
      email: recommendation.email,
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
  };

  const handleModify = (recommendationId: string) => {
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
  };

  const handleCancelEdit = () => {
    setCurrentFormId(undefined);
    setEditingOriginStatus(null);
  };

  const renderForm = (variant: 'desktop' | 'mobile' = 'desktop') => (
    <RecommendationForm
      form={form}
      errors={errors}
      formError={formError}
      editingOriginStatus={editingOriginStatus}
      variant={variant}
      currentUserRole={currentUser?.role}
      onFormChange={handleFormChange}
      onStakeChange={(stake) => setForm((prev) => ({ ...prev, stake }))}
      onWardChange={(ward) => setForm((prev) => ({ ...prev, ward }))}
      onServedMissionChange={(value) =>
        setForm((prev) => ({ ...prev, servedMission: value }))
      }
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmitDraft(RecommendationStatus.SUBMITTED);
      }}
      onSaveDraft={() => handleSubmitDraft(RecommendationStatus.DRAFT)}
      onCancel={handleCancelEdit}
    />
  );

  const renderDesktopDetails = () => (
    <RecommendationDetails
      selectedItem={selectedItem}
      isEditing={isEditing}
      currentUserId={currentUser?.id}
      getStatusLabel={getStatusLabel}
      onRecommendApplicant={handleRecommendApplicant}
      onModify={handleModify}
      onQuickSubmit={handleQuickSubmit}
      onCancelSubmission={handleCancelSubmission}
      onDelete={handleDelete}
      onError={setFormError}
      renderForm={renderForm}
    />
  );

  return (
    <section className={`${styles.review} ${styles.leaderRecommendations}`}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h1 className={styles.title}>{t('leader.recommendations.title')}</h1>
          <p className={styles.subtitle}>
            {t('leader.recommendations.subtitle')}
          </p>
        </div>
        <Button type='button' variant='primary' onClick={handleCreate}>
          {t('leader.recommendations.createRecommendation')}
        </Button>
      </div>

      {feedback && <p className={styles.banner}>{feedback}</p>}

      <Tabs
        items={TAB_DEFS}
        activeId={activeTab}
        onChange={(_, tab) => handleTabChange(tab.id)}
        className={styles.tabs}
        tabClassName={styles.tab}
        activeTabClassName={styles.tabActive}
        labelClassName={styles.tabLabel}
        badgeClassName={styles.tabPill}
        ariaLabel='Recommendation status filters'
        getBadge={(tab) =>
          combinedItems.filter((item) => {
            if (tab.id === 'all') return true;
            if (tab.id === 'submitted') {
              if ('isApplication' in item && item.isApplication) {
                return (
                  'status' in item && item.status === ApplicationStatus.AWAITING
                );
              }
              return (
                'status' in item &&
                item.status === RecommendationStatus.SUBMITTED
              );
            }
            return (
              !('isApplication' in item && item.isApplication) &&
              'status' in item &&
              item.status === tab.id
            );
          }).length
        }
      />

      <div className={styles.body}>
        <aside className={styles.list}>
          {listRecommendations.length ? (
            <ul>
              {listRecommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  <RecommendationListItem
                    item={recommendation}
                    isSelected={selectedId === recommendation.id}
                    isActive={currentFormId === recommendation.id}
                    onSelect={handleSelect}
                    getStatusLabel={getStatusLabel}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{t('leader.recommendations.empty')}</p>
          )}
        </aside>

        <div className={styles.details} aria-live='polite'>
          {renderDesktopDetails()}
        </div>
      </div>

      <div className={styles.mobile} aria-live='polite'>
        {isEditing && (
          <article className={`${styles.reviewCard} ${styles.mobileForm}`}>
            {renderForm('mobile')}
          </article>
        )}
        {filteredRecommendations.length ? (
          filteredRecommendations.map((item) => (
            <RecommendationMobileCard
              key={item.id}
              item={item}
              isEditingThis={currentFormId === item.id}
              currentFormId={currentFormId}
              getStatusLabel={getStatusLabel}
              onRecommendApplicant={handleRecommendApplicant}
              onModify={handleModify}
              onQuickSubmit={handleQuickSubmit}
              onCancelSubmission={handleCancelSubmission}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className={styles.empty}>{t('leader.recommendations.empty')}</p>
        )}
      </div>
    </section>
  );
};

export default LeaderRecommendations;
