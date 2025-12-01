import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { Button, Tabs } from '@/components/ui';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import type { TabItem, StatusOption } from '@/types';
import { useAdminReviewData } from './hooks/useAdminReviewData';
import { useAdminReviewState } from './hooks/useAdminReviewState';
import { useAdminReviewHandlers } from './hooks/useAdminReviewHandlers';
import { ReviewListItem } from './components/ReviewListItem';
import { ReviewDetails } from './components/ReviewDetails';
import { ReviewMobileCard } from './components/ReviewMobileCard';
import styles from './AdminReview.module.scss';

const AdminReview = () => {
  const { t } = useTranslation();

  const TABS: TabItem[] = useMemo(
    () => [
      { id: 'all', label: t('admin.review.tabs.all') },
      { id: 'awaiting', label: t('admin.review.tabs.awaiting') },
      { id: 'approved', label: t('admin.review.tabs.approved') },
      { id: 'rejected', label: t('admin.review.tabs.rejected') },
    ],
    [t]
  );

  const STATUS_OPTIONS: StatusOption[] = useMemo(
    () => [
      { value: 'awaiting', label: t('admin.review.status.awaiting') },
      { value: 'approved', label: t('admin.review.status.approved') },
      { value: 'rejected', label: t('admin.review.status.rejected') },
    ],
    [t]
  );
  const {
    applications,
    leaderRecommendations,
    updateApplicationStatus,
    updateLeaderRecommendationStatus,
    refetchApplications,
    refetchRecommendations,
  } = useApp();
  const location = useLocation();

  useEffect(() => {
    refetchApplications();
    refetchRecommendations();
  }, [refetchApplications, refetchRecommendations]);

  const {
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    statusSelection,
    setStatusSelection,
    showTodayOnly,
    setShowTodayOnly,
    todayTimestamp,
  } = useAdminReviewState({
    locationState: location.state as {
      initialTab?: string;
      focus?: string;
    } | null,
    tabs: TABS,
  });

  const { reviewItems, approvedApplications, statusCounts, filteredItems } =
    useAdminReviewData({
      applications,
      leaderRecommendations,
      activeTab,
      showTodayOnly,
      todayTimestamp,
    });

  const getStatusLabel = (status: string) =>
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  const getStakeDisplay = (stakeValue: string) => {
    return getStakeLabel(stakeValue) || stakeValue;
  };

  const getWardDisplay = (stakeValue: string, wardValue: string) => {
    return getWardLabel(stakeValue, wardValue) || wardValue;
  };

  const selectedItem =
    filteredItems.find((item) => item.key === selectedId) ?? null;

  const {
    handleStatusSelect,
    handleTabClick,
    handleInlineStatusChange,
    handleExportApproved,
  } = useAdminReviewHandlers({
    reviewItems,
    selectedItem,
    updateApplicationStatus,
    updateLeaderRecommendationStatus,
    setStatusSelection,
    setSelectedId,
    approvedApplications,
  });

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredItems.some((item) => item.key === selectedId)) {
      setSelectedId(filteredItems[0].key);
    }
  }, [filteredItems, selectedId, setSelectedId]);

  useEffect(() => {
    if (selectedItem) {
      setStatusSelection(selectedItem.status);
    } else {
      setStatusSelection(null);
    }
  }, [selectedItem, setStatusSelection]);

  return (
    <section className={styles.review}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h1>{t('admin.review.title')}</h1>
          <p className={styles.subtitle}>{t('admin.review.subtitle')}</p>
        </div>
        {activeTab === 'approved' && (
          <Button
            type='button'
            variant='primary'
            className={styles.export}
            onClick={handleExportApproved}
            disabled={!approvedApplications.length}
          >
            {t('admin.review.export')}
          </Button>
        )}
      </div>
      <Tabs
        items={TABS}
        activeId={activeTab}
        onChange={(_, tab) =>
          handleTabClick(tab.id, setActiveTab, setShowTodayOnly)
        }
        className={styles.tabs}
        tabClassName={styles.tab}
        activeTabClassName={styles.tabActive}
        labelClassName={styles.tabLabel}
        badgeClassName={styles.tabPill}
        ariaLabel={t('admin.review.tabs.ariaLabel')}
        getBadge={(tab) =>
          tab.id === 'all'
            ? statusCounts.all
            : (statusCounts[tab.id] ?? statusCounts.all)
        }
      />
      {showTodayOnly && (
        <div className={styles.filterChip}>
          {t('admin.review.filterToday')}
          <button type='button' onClick={() => setShowTodayOnly(false)}>
            {t('common.clear')}
          </button>
        </div>
      )}

      <div className={styles.body}>
        <aside className={styles.list} aria-label='Application list'>
          {filteredItems.length ? (
            <ul>
              {filteredItems.map((item) => (
                <li key={item.key}>
                  <ReviewListItem
                    item={item}
                    isSelected={item.key === selectedId}
                    onSelect={setSelectedId}
                    getStatusLabel={getStatusLabel}
                    getStakeDisplay={getStakeDisplay}
                    getWardDisplay={getWardDisplay}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{t('admin.review.empty')}</p>
          )}
        </aside>

        <div className={styles.details} aria-live='polite'>
          {selectedItem ? (
            <ReviewDetails
              selectedItem={selectedItem}
              statusSelection={statusSelection}
              statusOptions={STATUS_OPTIONS}
              onStatusChange={handleStatusSelect}
              getStakeDisplay={getStakeDisplay}
              getWardDisplay={getWardDisplay}
              t={t}
            />
          ) : (
            <div className={styles.placeholder}>
              {t('admin.review.selectPlaceholder')}
            </div>
          )}
        </div>
      </div>
      <div className={styles.mobile} aria-live='polite'>
        {filteredItems.length ? (
          filteredItems.map((item) => (
            <ReviewMobileCard
              key={item.key}
              item={item}
              statusOptions={STATUS_OPTIONS}
              onStatusChange={(key, status) =>
                handleInlineStatusChange(key, status, selectedItem)
              }
              getStakeDisplay={getStakeDisplay}
              getWardDisplay={getWardDisplay}
              t={t}
            />
          ))
        ) : (
          <p className={styles.empty}>{t('admin.review.empty')}</p>
        )}
      </div>
    </section>
  );
};

export default AdminReview;
