import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Application, LeaderRecommendation } from '@vibe-apply/shared';
import { ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import {
  Button,
  ComboBox,
  DetailsGrid,
  DetailsGridItem,
  DetailsNotes,
  StatusChip,
  Tabs,
} from '@/components/ui';
import { ReviewItemTags } from '@/components';
import { resetTimeToMidnight } from '@/utils/validationConstants';
import {
  normalizeRecommendationStatus,
  remapStatusForRecommendation,
} from '@/utils/statusHelpers';
import { exportApprovedApplicationsToCSV } from '@/utils/exportData';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import type { TabItem, StatusOption, ReviewItem } from '@/types';
import styles from './AdminReview.module.scss';

interface LocationState {
  initialTab?: string;
  focus?: string;
}

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
  const locationStateRef = useRef<LocationState | null>(null);

  useEffect(() => {
    refetchApplications();
    refetchRecommendations();
  }, [refetchApplications, refetchRecommendations]);

  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = (location.state as LocationState)?.initialTab;
    return requestedTab && TABS.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : ApplicationStatus.AWAITING;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusSelection, setStatusSelection] = useState<string | null>(null);
  const [showTodayOnly, setShowTodayOnly] = useState(
    () => (location.state as LocationState)?.focus === 'today'
  );
  const todayTimestamp = useMemo(() => {
    return resetTimeToMidnight(new Date()).getTime();
  }, []);

  useEffect(() => {
    if (locationStateRef.current === (location.state as LocationState)) {
      return;
    }
    locationStateRef.current = location.state as LocationState;
    const requestedTab = (location.state as LocationState)?.initialTab;
    if (requestedTab && TABS.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
    setShowTodayOnly((location.state as LocationState)?.focus === 'today');
  }, [location.state]);

  const getStatusLabel = (status: string) =>
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  const getStakeDisplay = (stakeValue: string) => {
    return getStakeLabel(stakeValue) || stakeValue;
  };

  const getWardDisplay = (stakeValue: string, wardValue: string) => {
    return getWardLabel(stakeValue, wardValue) || wardValue;
  };

  const reviewItems = useMemo(() => {
    const applicationById = new Map<string, Application>();
    applications.forEach((app) => {
      applicationById.set(app.id, app);
    });

    const recommendationById = new Map<string, LeaderRecommendation>();
    const recommendationsByLinkedAppId = new Map<
      string,
      LeaderRecommendation
    >();
    leaderRecommendations
      .filter((rec) => rec.status !== RecommendationStatus.DRAFT)
      .forEach((rec) => {
        recommendationById.set(rec.id, rec);
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

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredItems.some((item) => item.key === selectedId)) {
      setSelectedId(filteredItems[0].key);
    }
  }, [filteredItems, selectedId]);

  const selectedItem =
    filteredItems.find((item) => item.key === selectedId) ?? null;

  useEffect(() => {
    if (selectedItem) {
      setStatusSelection(selectedItem.status);
    } else {
      setStatusSelection(null);
    }
  }, [selectedItem?.key, selectedItem?.status]);

  const currentStatus = selectedItem
    ? (statusSelection ?? selectedItem.status)
    : null;
  const statusSelectId = selectedItem
    ? `review-status-${selectedItem.key}`
    : 'review-status-select';

  const handleStatusSelect = async (event: ChangeEvent<HTMLSelectElement>) => {
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
      // Revert status selection on error
      setStatusSelection(selectedItem.status);
      void error;
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowTodayOnly(false);
  };

  const handleInlineStatusChange = async (entryKey: string, status: string) => {
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

      if (selectedItem?.key === entryKey) {
        setStatusSelection(status);
      }
      setSelectedId(entryKey);
    } catch (error) {
      void error;
    }
  };

  const handleExportApproved = () => {
    exportApprovedApplicationsToCSV(approvedApplications);
  };

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
        onChange={handleTabClick}
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
                  <button
                    type='button'
                    className={
                      item.key === selectedId
                        ? `${styles.listItem} ${styles.listItemActive}`
                        : styles.listItem
                    }
                    onClick={() => setSelectedId(item.key)}
                    aria-current={item.key === selectedId ? 'true' : 'false'}
                  >
                    <div className={styles.listTop}>
                      <span className={styles.listName}>{item.name}</span>
                      <StatusChip
                        status={item.status}
                        label={getStatusLabel(item.status)}
                      />
                    </div>
                    <div className={styles.listBottom}>
                      <span className={styles.listMeta}>
                        {getStakeDisplay(item.stake)}
                      </span>
                      <span className={styles.listMeta}>
                        {getWardDisplay(item.stake, item.ward)}
                      </span>
                      <span className={`${styles.listMeta} ${styles.listDate}`}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <ReviewItemTags
                        type={item.type}
                        hasRecommendation={item.hasRecommendation}
                        hasApplication={item.hasApplication}
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{t('admin.review.empty')}</p>
          )}
        </aside>

        <div className={styles.details} aria-live='polite'>
          {selectedItem ? (
            <div className={styles.detailsCard}>
              <header className={styles.detailsHeader}>
                <div className={styles.detailsInfo}>
                  <div className={styles.detailsHeading}>
                    <h2>{selectedItem.name}</h2>
                    <div className={styles.detailsTags}>
                      {selectedItem.type === 'application' && (
                        <>
                          {selectedItem.hasRecommendation ? (
                            <span
                              className={`${styles.detailsTag} ${styles.detailsTagRecommendation}`}
                            >
                              {t('admin.review.tags.recommended')}
                            </span>
                          ) : (
                            <span
                              className={`${styles.detailsTag} ${styles.detailsTagApplication}`}
                            >
                              {t('admin.review.tags.applied')}
                            </span>
                          )}
                        </>
                      )}
                      {selectedItem.type === 'recommendation' && (
                        <>
                          <span
                            className={`${styles.detailsTag} ${styles.detailsTagRecommendation}`}
                          >
                            {t('admin.review.tags.recommended')}
                          </span>
                          {selectedItem.hasApplication && (
                            <span
                              className={`${styles.detailsTag} ${styles.detailsTagApplication}`}
                            >
                              {t('admin.review.tags.applied')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <p className={styles.detailsMeta}>
                    {t('admin.review.submitted')}{' '}
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className={styles.statusControl}>
                  <ComboBox
                    id={statusSelectId}
                    name='status'
                    label={t('admin.review.statusLabel')}
                    value={currentStatus ?? ApplicationStatus.AWAITING}
                    onChange={handleStatusSelect}
                    tone={currentStatus ?? ApplicationStatus.AWAITING}
                    options={STATUS_OPTIONS}
                    wrapperClassName={styles.statusLabel}
                    labelClassName={styles.statusText}
                  />
                  <span className={styles.statusHint}>
                    {t('admin.review.statusHint')}
                  </span>
                </div>
              </header>

              <DetailsGrid className={styles.grid}>
                <DetailsGridItem label={t('common.email')}>
                  {selectedItem.email}
                </DetailsGridItem>
                <DetailsGridItem label={t('common.phone')}>
                  {selectedItem.phone}
                </DetailsGridItem>
                <DetailsGridItem label={t('admin.review.age')}>
                  {selectedItem.age ?? t('admin.roles.nA')}
                </DetailsGridItem>
                <DetailsGridItem label={t('common.stake')}>
                  {getStakeDisplay(selectedItem.stake)}
                </DetailsGridItem>
                <DetailsGridItem label={t('common.ward')}>
                  {getWardDisplay(selectedItem.stake, selectedItem.ward)}
                </DetailsGridItem>
                <DetailsGridItem label={t('admin.review.gender')}>
                  {selectedItem.gender ?? t('admin.roles.nA')}
                </DetailsGridItem>
              </DetailsGrid>

              <DetailsNotes
                title={t('admin.review.additionalInfo')}
                className={styles.notes}
              >
                {selectedItem.moreInfo || t('admin.review.noAdditionalInfo')}
              </DetailsNotes>
            </div>
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
            <article key={item.key} className={styles.reviewCard}>
              <div className={styles.reviewCardHeader}>
                <div>
                  <h2>{item.name}</h2>
                  <p className={styles.reviewCardMeta}>
                    {t('admin.review.submitted')}{' '}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <ComboBox
                  name={`mobile-status-${item.key}`}
                  label={t('admin.review.statusLabel')}
                  value={item.status}
                  onChange={(event) =>
                    handleInlineStatusChange(item.key, event.target.value)
                  }
                  options={STATUS_OPTIONS}
                  tone={item.status}
                  wrapperClassName={styles.reviewCardStatus}
                  labelClassName={styles.reviewCardStatusLabel}
                  ariaLabel={t('admin.review.updateStatus', {
                    name: item.name,
                  })}
                />
              </div>

              <div className={styles.reviewCardTags}>
                {item.type === 'application' && (
                  <>
                    {item.hasRecommendation ? (
                      <span
                        className={`${styles.reviewCardTag} ${styles.reviewCardTagRecommendation}`}
                      >
                        {t('admin.review.tags.recommended')}
                      </span>
                    ) : (
                      <span
                        className={`${styles.reviewCardTag} ${styles.reviewCardTagApplication}`}
                      >
                        {t('admin.review.tags.applied')}
                      </span>
                    )}
                  </>
                )}
                {item.type === 'recommendation' && (
                  <>
                    <span
                      className={`${styles.reviewCardTag} ${styles.reviewCardTagRecommendation}`}
                    >
                      {t('admin.review.tags.recommended')}
                    </span>
                    {item.hasApplication && (
                      <span
                        className={`${styles.reviewCardTag} ${styles.reviewCardTagApplication}`}
                      >
                        {t('admin.review.tags.applied')}
                      </span>
                    )}
                  </>
                )}
              </div>

              <dl className={styles.reviewCardGrid}>
                <div>
                  <dt>{t('common.email')}</dt>
                  <dd>{item.email}</dd>
                </div>
                <div>
                  <dt>{t('common.phone')}</dt>
                  <dd>{item.phone}</dd>
                </div>
                <div>
                  <dt>{t('admin.review.age')}</dt>
                  <dd>{item.age ?? t('admin.roles.nA')}</dd>
                </div>
                <div>
                  <dt>{t('common.stake')}</dt>
                  <dd>{getStakeDisplay(item.stake)}</dd>
                </div>
                <div>
                  <dt>{t('common.ward')}</dt>
                  <dd>{getWardDisplay(item.stake, item.ward)}</dd>
                </div>
                <div>
                  <dt>{t('admin.review.gender')}</dt>
                  <dd>{item.gender ?? t('admin.roles.nA')}</dd>
                </div>
              </dl>

              <div className={styles.reviewCardNotes}>
                <h3>{t('admin.review.additionalInfo')}</h3>
                <p>{item.moreInfo || t('admin.review.noAdditionalInfo')}</p>
              </div>
            </article>
          ))
        ) : (
          <p className={styles.empty}>{t('admin.review.empty')}</p>
        )}
      </div>
    </section>
  );
};

export default AdminReview;
