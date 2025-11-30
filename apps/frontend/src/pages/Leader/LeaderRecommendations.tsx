import { Suspense, lazy, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { Button, Tabs } from '@/components/ui';
import { RecommendationListItem } from './components/RecommendationListItem';
import { useRecommendationForm } from './hooks/useRecommendationForm';
import { useRecommendationData } from './hooks/useRecommendationData';
import { useRecommendationHandlers } from './hooks/useRecommendationHandlers';
import type { TabItem } from '@/types';
import styles from './LeaderRecommendations.module.scss';

const RecommendationForm = lazy(() =>
  import('./components/RecommendationForm').then((module) => ({
    default: module.RecommendationForm,
  }))
);
const RecommendationDetails = lazy(() =>
  import('./components/RecommendationDetails').then((module) => ({
    default: module.RecommendationDetails,
  }))
);
const RecommendationMobileCard = lazy(() =>
  import('./components/RecommendationMobileCard').then((module) => ({
    default: module.RecommendationMobileCard,
  }))
);

interface LocationState {
  action?: string;
}

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
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if ((state as LocationState)?.action === 'create') {
      setCurrentFormId(null);
      setSelectedId(null);
    }
  }, [state]);

  const {
    form,
    setForm,
    errors,
    setErrors,
    formError,
    setFormError,
    editingOriginStatus,
    setEditingOriginStatus,
    handleFormChange,
    validateForm,
  } = useRecommendationForm({
    currentFormId,
    currentUser,
    recommendations: leaderRecommendations,
    t,
  });

  const {
    combinedItems,
    filteredRecommendations,
    listRecommendations,
    selectedItem,
    isEditing,
    shouldUpdateSelectedId,
    shouldUpdateCurrentFormId,
  } = useRecommendationData({
    recommendations: leaderRecommendations,
    applications,
    currentUser,
    activeTab,
    selectedId,
    currentFormId,
  });

  useEffect(() => {
    if (shouldUpdateSelectedId !== null) {
      setSelectedId(shouldUpdateSelectedId);
    }
  }, [shouldUpdateSelectedId]);

  useEffect(() => {
    if (shouldUpdateCurrentFormId !== currentFormId) {
      setCurrentFormId(shouldUpdateCurrentFormId);
    }
  }, [shouldUpdateCurrentFormId, currentFormId]);

  const {
    handleRecommendApplicant,
    handleSubmitDraft,
    handleDelete,
    handleQuickSubmit,
    handleCancelSubmission,
    handleModify,
    handleCancelEdit,
    handleSelect,
    handleCreate,
  } = useRecommendationHandlers({
    leaderId,
    recommendations: leaderRecommendations,
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
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderForm = (variant: 'desktop' | 'mobile' = 'desktop') => (
    <Suspense fallback={null}>
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
    </Suspense>
  );

  const renderDesktopDetails = () => (
    <Suspense fallback={null}>
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
    </Suspense>
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
          <Suspense fallback={null}>
            {filteredRecommendations.map((item) => (
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
            ))}
          </Suspense>
        ) : (
          <p className={styles.empty}>{t('leader.recommendations.empty')}</p>
        )}
      </div>
    </section>
  );
};

export default LeaderRecommendations;
