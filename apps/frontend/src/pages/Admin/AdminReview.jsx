import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { Button, ComboBox, StatusChip, Tabs } from '../../components/ui';
import './AdminReview.scss';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'awaiting', label: 'Awaiting' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const STATUS_OPTIONS = [
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const normalizeRecommendationStatus = (status) => {
  if (status === 'submitted') {
    return 'awaiting';
  }
  return status;
};

const remapStatusForRecommendation = (status) => {
  if (status === 'awaiting') {
    return 'submitted';
  }
  return status;
};

const AdminReview = () => {
  const {
    applications,
    leaderRecommendations,
    updateApplicationStatus,
    updateLeaderRecommendationStatus,
  } = useApp();
  const location = useLocation();
  const locationStateRef = useRef(null);

  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = location.state?.initialTab;
    return requestedTab && TABS.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : 'awaiting';
  });
  const [selectedId, setSelectedId] = useState(null);
  const [statusSelection, setStatusSelection] = useState(null);
  const [showTodayOnly, setShowTodayOnly] = useState(
    () => location.state?.focus === 'today'
  );
  const todayTimestamp = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);

  useEffect(() => {
    if (locationStateRef.current === location.state) {
      return;
    }
    locationStateRef.current = location.state;
    const requestedTab = location.state?.initialTab;
    if (requestedTab && TABS.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
    setShowTodayOnly(location.state?.focus === 'today');
  }, [location.state]);

  const getStatusLabel = (status) =>
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  const reviewItems = useMemo(() => {
    const applicationById = new Map();
    applications.forEach((app) => {
      applicationById.set(app.id, app);
    });

    const recommendationById = new Map();
    const recommendationsByLinkedAppId = new Map();
    leaderRecommendations
      .filter((rec) => rec.status !== 'draft')
      .forEach((rec) => {
        recommendationById.set(rec.id, rec);
        if (rec.linkedApplicationId) {
          recommendationsByLinkedAppId.set(rec.linkedApplicationId, rec);
        }
      });

    const processedIds = new Set();
    const items = [];

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
    const counts = {
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
        const created = new Date(item.createdAt);
        created.setHours(0, 0, 0, 0);
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

  const handleStatusSelect = (event) => {
    if (!selectedItem) {
      return;
    }
    const nextStatus = event.target.value;
    setStatusSelection(nextStatus);
    if (selectedItem.type === 'application') {
      updateApplicationStatus(selectedItem.entityId, nextStatus);
    } else {
      updateLeaderRecommendationStatus(
        selectedItem.entityId,
        remapStatusForRecommendation(nextStatus)
      );
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowTodayOnly(false);
  };

  const handleInlineStatusChange = (entryKey, status) => {
    if (!status) {
      return;
    }
    const item = reviewItems.find((entry) => entry.key === entryKey);
    if (!item) {
      return;
    }

    if (item.type === 'application') {
      updateApplicationStatus(item.entityId, status);
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
    if (!approvedApplications.length) {
      return;
    }

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Age',
      'Gender',
      'Stake',
      'Ward',
      'Status',
      'Submitted At',
      'Last Updated',
      'More Info',
    ];

    const rows = approvedApplications.map((app) => [
      app.name,
      app.email,
      app.phone,
      app.age ?? '',
      app.gender ?? '',
      app.stake,
      app.ward,
      app.status,
      new Date(app.createdAt).toLocaleString(),
      new Date(app.updatedAt).toLocaleString(),
      app.moreInfo?.replace(/\r?\n/g, ' ') ?? '',
    ]);

    const escapeCell = (value) => {
      const cell = String(value ?? '');
      if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `approved-applications-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className='review'>
      <div className='review__header'>
        <div className='review__header-copy'>
          <h1 className='review__title'>Review Applications</h1>
          <p className='review__subtitle'>
            Manage incoming applications and update their statuses.
          </p>
        </div>
        {activeTab === 'approved' && (
          <Button
            type='button'
            variant='primary'
            className='review__export'
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
        className='review__tabs'
        tabClassName='review__tab'
        activeTabClassName='review__tab--active'
        labelClassName='review__tab-label'
        badgeClassName='review__tab-pill'
        ariaLabel='Application status filters'
        getBadge={(tab) =>
          tab.id === 'all'
            ? statusCounts.all
            : (statusCounts[tab.id] ?? statusCounts.all)
        }
      />

      {showTodayOnly && (
        <div className='review__filter-chip'>
          Showing submissions from today
          <button type='button' onClick={() => setShowTodayOnly(false)}>
            Clear
          </button>
        </div>
      )}

      <div className='review__body'>
        <aside className='review__list' aria-label='Application list'>
          {filteredItems.length ? (
            <ul>
              {filteredItems.map((item) => (
                <li key={item.key}>
                  <button
                    type='button'
                    className={
                      item.key === selectedId
                        ? 'review__list-item review__list-item--active'
                        : 'review__list-item'
                    }
                    onClick={() => setSelectedId(item.key)}
                    aria-current={item.key === selectedId ? 'true' : 'false'}
                  >
                    <div className='review__list-top'>
                      <span className='review__list-name'>{item.name}</span>
                      <StatusChip
                        status={item.status}
                        label={getStatusLabel(item.status)}
                      />
                    </div>
                    <div className='review__list-bottom'>
                      <span className='review__list-meta'>{item.stake}</span>
                      <span className='review__list-meta'>{item.ward}</span>
                      <span className='review__list-meta review__list-date'>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <div className='review__list-tags'>
                        {item.type === 'application' && (
                          <span className='review__list-tag review__list-tag--application'>
                            Applied
                          </span>
                        )}
                        {item.type === 'recommendation' && (
                          <span className='review__list-tag review__list-tag--recommendation'>
                            Recommended
                          </span>
                        )}
                        {item.type === 'application' && item.hasRecommendation && (
                          <span className='review__list-tag review__list-tag--recommendation'>
                            Recommended
                          </span>
                        )}
                        {item.type === 'recommendation' && item.hasApplication && (
                          <span className='review__list-tag review__list-tag--application'>
                            Applied
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className='review__empty'>No applications found for this tab.</p>
          )}
        </aside>

        <div className='review__details' aria-live='polite'>
          {selectedItem ? (
            <div className='review__details-card'>
              <header className='review__details-header'>
                <div className='review__details-info'>
                  <div className='review__details-heading'>
                    <h2>{selectedItem.name}</h2>
                    <div className='review__details-tags'>
                      {selectedItem.type === 'application' && (
                        <span className='review__details-tag review__details-tag--application'>
                          Applied
                        </span>
                      )}
                      {selectedItem.type === 'recommendation' && (
                        <span className='review__details-tag review__details-tag--recommendation'>
                          Recommended
                        </span>
                      )}
                      {selectedItem.type === 'application' && selectedItem.hasRecommendation && (
                        <span className='review__details-tag review__details-tag--recommendation'>
                          Recommended
                        </span>
                      )}
                      {selectedItem.type === 'recommendation' && selectedItem.hasApplication && (
                        <span className='review__details-tag review__details-tag--application'>
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedItem.type === 'recommendation' && (
                    <p className='review__details-origin'>
                      Leader Recommendation
                    </p>
                  )}
                  <p className='review__details-meta'>
                    Submitted{' '}
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className='review__status-control'>
                  <ComboBox
                    id={statusSelectId}
                    name='status'
                    label='Status'
                    value={currentStatus ?? 'awaiting'}
                    onChange={handleStatusSelect}
                    tone={currentStatus ?? 'awaiting'}
                    options={STATUS_OPTIONS}
                    wrapperClassName='review__status-label'
                    labelClassName='review__status-text'
                  />
                  <span className='review__status-hint'>
                    Selecting updates instantly.
                  </span>
                </div>
              </header>

              <dl className='review__grid'>
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

              <div className='review__notes'>
                <h3>Additional Information</h3>
                <p>
                  {selectedItem.moreInfo ||
                    'No additional information provided.'}
                </p>
              </div>
            </div>
          ) : (
            <div className='review__placeholder'>
              Select an application to review its details.
            </div>
          )}
        </div>
      </div>

      <div className='review__mobile' aria-live='polite'>
        {filteredItems.length ? (
          filteredItems.map((item) => (
            <article key={item.key} className='review-card'>
              <div className='review-card__header'>
                <div>
                  <h2>{item.name}</h2>
                  <p className='review-card__meta'>
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
                  wrapperClassName='review-card__status'
                  labelClassName='review-card__status-label'
                  ariaLabel={`Update status for ${item.name}`}
                />
              </div>

              <div className='review-card__tags'>
                {item.type === 'application' && (
                  <span className='review-card__tag review-card__tag--application'>
                    Applied
                  </span>
                )}
                {item.type === 'recommendation' && (
                  <span className='review-card__tag review-card__tag--recommendation'>
                    Recommended
                  </span>
                )}
                {item.type === 'application' && item.hasRecommendation && (
                  <span className='review-card__tag review-card__tag--recommendation'>
                    Recommended
                  </span>
                )}
                {item.type === 'recommendation' && item.hasApplication && (
                  <span className='review-card__tag review-card__tag--application'>
                    Applied
                  </span>
                )}
                {item.type === 'recommendation' && (
                  <span className='review-card__source'>
                    Leader Recommendation
                  </span>
                )}
              </div>

              <dl className='review-card__grid'>
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

              <div className='review-card__notes'>
                <h3>Additional Information</h3>
                <p>{item.moreInfo || 'No additional information provided.'}</p>
              </div>
            </article>
          ))
        ) : (
          <p className='review__empty'>No applications found for this tab.</p>
        )}
      </div>
    </section>
  );
};

export default AdminReview;
