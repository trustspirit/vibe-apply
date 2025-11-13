import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import type { Application, LeaderRecommendation, ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { Button, ComboBox, StatusChip, Tabs } from '@/components/ui';
import { ReviewItemTags } from '@/components';
import { resetTimeToMidnight } from '@/utils/validationConstants';
import { normalizeRecommendationStatus, remapStatusForRecommendation } from '@/utils/statusHelpers';
import { exportApprovedApplicationsToCSV } from '@/utils/exportData';
import type { TabItem, StatusOption, ReviewItem } from '@/types';
import styles from './AdminReview.module.scss';

interface LocationState {
  initialTab?: string;
  focus?: string;
}

const TABS: TabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'awaiting', label: 'Awaiting' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminReview = () => {
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
      : 'awaiting';
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

  const reviewItems = useMemo(() => {
    const applicationById = new Map<string, Application>();
    applications.forEach((app) => {
      applicationById.set(app.id, app);
    });

    const recommendationById = new Map<string, LeaderRecommendation>();
    const recommendationsByLinkedAppId = new Map<string, LeaderRecommendation>();
    leaderRecommendations
      .filter((rec) => rec.status !== 'draft')
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
      .filter((rec) => rec.status !== 'draft')
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
    () => applications.filter((app) => app.status === 'approved'),
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
      if (item.status === 'awaiting') {
        counts.awaiting += 1;
      }
      if (item.status === 'approved') {
        counts.approved += 1;
      }
      if (item.status === 'rejected') {
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
  }, [selectedItem]);

  const currentStatus = selectedItem
    ? (statusSelection ?? selectedItem.status)
    : null;
  const statusSelectId = selectedItem
    ? `review-status-${selectedItem.key}`
    : 'review-status-select';

  const handleStatusSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!selectedItem) {
      return;
    }
    const nextStatus = event.target.value;
    setStatusSelection(nextStatus);
    if (selectedItem.type === 'application') {
      updateApplicationStatus(selectedItem.entityId, nextStatus as ApplicationStatus);
    } else {
      updateLeaderRecommendationStatus(
        selectedItem.entityId,
        remapStatusForRecommendation(nextStatus)
      );
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowTodayOnly(false);
  };

  const handleInlineStatusChange = (entryKey: string, status: string) => {
    if (!status) {
      return;
    }
    const item = reviewItems.find((entry) => entry.key === entryKey);
    if (!item) {
      return;
    }

    if (item.type === 'application') {
      updateApplicationStatus(item.entityId, status as ApplicationStatus);
    } else {
      updateLeaderRecommendationStatus(
        item.entityId,
        remapStatusForRecommendation(status)
      );
    }

    if (selectedItem?.key === entryKey) {
      setStatusSelection(status);
    }
    setSelectedId(entryKey);
  };

  const handleExportApproved = () => {
    exportApprovedApplicationsToCSV(approvedApplications);
  };

  return (
    <section className={styles.review}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h1>Review Applications</h1>
          <p className={styles.subtitle}>
            Manage incoming applications and update their statuses.
          </p>
        </div>
        {activeTab === 'approved' && (
          <Button
            type='button'
            variant='primary'
            className={styles.export}
            onClick={handleExportApproved}
            disabled={!approvedApplications.length}
          >
            Export as CSV
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
        ariaLabel='Application status filters'
        getBadge={(tab) =>
          tab.id === 'all'
            ? statusCounts.all
            : (statusCounts[tab.id] ?? statusCounts.all)
        }
      />

      {showTodayOnly && (
        <div className={styles.filterChip}>
          Showing submissions from today
          <button type='button' onClick={() => setShowTodayOnly(false)}>
            Clear
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
                      <span className={styles.listMeta}>{item.stake}</span>
                      <span className={styles.listMeta}>{item.ward}</span>
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
            <p className={styles.empty}>No applications found for this tab.</p>
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
                        <span className={`${styles.detailsTag} ${styles.detailsTagApplication}`}>
                          Applied
                        </span>
                      )}
                      {selectedItem.type === 'recommendation' && (
                        <span className={`${styles.detailsTag} ${styles.detailsTagRecommendation}`}>
                          Recommended
                        </span>
                      )}
                      {selectedItem.type === 'application' && selectedItem.hasRecommendation && (
                        <span className={`${styles.detailsTag} ${styles.detailsTagRecommendation}`}>
                          Recommended
                        </span>
                      )}
                      {selectedItem.type === 'recommendation' && selectedItem.hasApplication && (
                        <span className={`${styles.detailsTag} ${styles.detailsTagApplication}`}>
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedItem.type === 'recommendation' && (
                    <p className={styles.detailsOrigin}>
                      Leader Recommendation
                    </p>
                  )}
                  <p className={styles.detailsMeta}>
                    Submitted{' '}
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className={styles.statusControl}>
                  <ComboBox
                    id={statusSelectId}
                    name='status'
                    label='Status'
                    value={currentStatus ?? 'awaiting'}
                    onChange={handleStatusSelect}
                    tone={currentStatus ?? 'awaiting'}
                    options={STATUS_OPTIONS}
                    wrapperClassName={styles.statusLabel}
                    labelClassName={styles.statusText}
                  />
                  <span className={styles.statusHint}>
                    Selecting updates instantly.
                  </span>
                </div>
              </header>

              <dl className={styles.grid}>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedItem.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selectedItem.phone}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{selectedItem.age ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt>Stake</dt>
                  <dd>{selectedItem.stake}</dd>
                </div>
                <div>
                  <dt>Ward</dt>
                  <dd>{selectedItem.ward}</dd>
                </div>
                <div>
                  <dt>Gender</dt>
                  <dd>{selectedItem.gender ?? 'N/A'}</dd>
                </div>
              </dl>

              <div className={styles.notes}>
                <h3>Additional Information</h3>
                <p>
                  {selectedItem.moreInfo ||
                    'No additional information provided.'}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.placeholder}>
              Select an application to review its details.
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
                    Submitted {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <ComboBox
                  name={`mobile-status-${item.key}`}
                  label='Status'
                  value={item.status}
                  onChange={(event) =>
                    handleInlineStatusChange(item.key, event.target.value)
                  }
                  options={STATUS_OPTIONS}
                  tone={item.status}
                  wrapperClassName={styles.reviewCardStatus}
                  labelClassName={styles.reviewCardStatusLabel}
                  ariaLabel={`Update status for ${item.name}`}
                />
              </div>

              <div className={styles.reviewCardTags}>
                {item.type === 'application' && (
                  <span className={`${styles.reviewCardTag} ${styles.reviewCardTagApplication}`}>
                    Applied
                  </span>
                )}
                {item.type === 'recommendation' && (
                  <span className={`${styles.reviewCardTag} ${styles.reviewCardTagRecommendation}`}>
                    Recommended
                  </span>
                )}
                {item.type === 'application' && item.hasRecommendation && (
                  <span className={`${styles.reviewCardTag} ${styles.reviewCardTagRecommendation}`}>
                    Recommended
                  </span>
                )}
                {item.type === 'recommendation' && item.hasApplication && (
                  <span className={`${styles.reviewCardTag} ${styles.reviewCardTagApplication}`}>
                    Applied
                  </span>
                )}
                {item.type === 'recommendation' && (
                  <span className={styles.reviewCardSource}>
                    Leader Recommendation
                  </span>
                )}
              </div>

              <dl className={styles.reviewCardGrid}>
                <div>
                  <dt>Email</dt>
                  <dd>{item.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{item.phone}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{item.age ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt>Stake</dt>
                  <dd>{item.stake}</dd>
                </div>
                <div>
                  <dt>Ward</dt>
                  <dd>{item.ward}</dd>
                </div>
                <div>
                  <dt>Gender</dt>
                  <dd>{item.gender ?? 'N/A'}</dd>
                </div>
              </dl>

              <div className={styles.reviewCardNotes}>
                <h3>Additional Information</h3>
                <p>{item.moreInfo || 'No additional information provided.'}</p>
              </div>
            </article>
          ))
        ) : (
          <p className={styles.empty}>No applications found for this tab.</p>
        )}
      </div>
    </section>
  );
};

export default AdminReview;
