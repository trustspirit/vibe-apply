import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import './AdminReview.scss';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'awaiting', label: 'Awaiting' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const STATUS_OPTIONS = [
  { value: 'awaiting', label: 'Awaiting Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminReview = () => {
  const { applications, updateApplicationStatus } = useApp();
  const [activeTab, setActiveTab] = useState('awaiting');
  const [selectedId, setSelectedId] = useState(null);
  const [statusSelection, setStatusSelection] = useState(null);

  const getStatusLabel = (status) => STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  const approvedApplications = useMemo(
    () => applications.filter((app) => app.status === 'approved'),
    [applications],
  );

  const statusCounts = useMemo(
    () => ({
      all: applications.length,
      awaiting: applications.filter((app) => app.status === 'awaiting').length,
      approved: applications.filter((app) => app.status === 'approved').length,
      rejected: applications.filter((app) => app.status === 'rejected').length,
    }),
    [applications],
  );

  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') {
      return applications;
    }
    return applications.filter((app) => app.status === activeTab);
  }, [applications, activeTab]);

  useEffect(() => {
    if (!filteredApplications.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredApplications.some((app) => app.id === selectedId)) {
      setSelectedId(filteredApplications[0].id);
    }
  }, [filteredApplications, selectedId]);

  const selectedApplication = filteredApplications.find((app) => app.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedApplication) {
      setStatusSelection(selectedApplication.status);
    } else {
      setStatusSelection(null);
    }
  }, [selectedApplication]);

  const currentStatus = selectedApplication ? statusSelection ?? selectedApplication.status : null;
  const statusSelectId = selectedApplication ? `review-status-${selectedApplication.id}` : 'review-status-select';

  const handleStatusSelect = (event) => {
    if (!selectedApplication) {
      return;
    }
    const nextStatus = event.target.value;
    setStatusSelection(nextStatus);
    updateApplicationStatus(selectedApplication.id, nextStatus);
  };

  const handleInlineStatusChange = (applicationId, status) => {
    updateApplicationStatus(applicationId, status);
    if (selectedApplication?.id === applicationId) {
      setStatusSelection(status);
    }
    setSelectedId(applicationId);
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
    <section className="review">
      <div className="review__header">
        <div className="review__header-copy">
          <h1 className="review__title">Review Applications</h1>
          <p className="review__subtitle">Manage incoming applications and update their statuses.</p>
        </div>
        {activeTab === 'approved' && (
          <button
            type="button"
            className="btn btn--primary review__export"
            onClick={handleExportApproved}
            disabled={!approvedApplications.length}
          >
            Export as CSV
          </button>
        )}
      </div>

      <div className="review__tabs" role="tablist" aria-label="Application status filters">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab}
            className={tab.id === activeTab ? 'review__tab review__tab--active' : 'review__tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="review__tab-label">{tab.label}</span>
            <span className="review__tab-pill">{statusCounts[tab.id] ?? statusCounts.all}</span>
          </button>
        ))}
      </div>

      <div className="review__body">
        <aside className="review__list" aria-label="Application list">
          {filteredApplications.length ? (
            <ul>
              {filteredApplications.map((app) => (
                <li key={app.id}>
                  <button
                    type="button"
                    className={app.id === selectedId ? 'review__list-item review__list-item--active' : 'review__list-item'}
                    onClick={() => setSelectedId(app.id)}
                    aria-current={app.id === selectedId ? 'true' : 'false'}
                  >
                    <div className="review__list-top">
                      <span className="review__list-name">{app.name}</span>
                      <span className={`status-chip status-chip--${app.status}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                    <div className="review__list-bottom">
                      <span className="review__list-meta">{app.stake}</span>
                      <span className="review__list-meta">{app.ward}</span>
                      <span className="review__list-meta review__list-date">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="review__empty">No applications found for this tab.</p>
          )}
        </aside>

        <div className="review__details" aria-live="polite">
          {selectedApplication ? (
            <div className="review__details-card">
              <header className="review__details-header">
                <div>
                  <h2>{selectedApplication.name}</h2>
                  <p className="review__details-meta">
                    Submitted {new Date(selectedApplication.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="review__status-control">
                  <label className="review__status-label" htmlFor={statusSelectId}>
                    <span className="review__status-text">Status</span>
                    <select
                      id={statusSelectId}
                      value={currentStatus ?? 'awaiting'}
                      onChange={handleStatusSelect}
                      className={`combo combo--${currentStatus ?? 'awaiting'}`}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="review__status-hint">Selecting updates instantly.</span>
                </div>
              </header>

              <dl className="review__grid">
                <div>
                  <dt>Email</dt>
                  <dd>{selectedApplication.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selectedApplication.phone}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{selectedApplication.age ?? "N/A"}</dd>
                </div>
                <div>
                  <dt>Stake</dt>
                  <dd>{selectedApplication.stake}</dd>
                </div>
                <div>
                  <dt>Ward</dt>
                  <dd>{selectedApplication.ward}</dd>
                </div>
                <div>
                  <dt>Gender</dt>
                  <dd>{selectedApplication.gender ?? 'N/A'}</dd>
                </div>
              </dl>

              <div className="review__notes">
                <h3>Additional Information</h3>
                <p>{selectedApplication.moreInfo || 'No additional information provided.'}</p>
              </div>
            </div>
          ) : (
            <div className="review__placeholder">Select an application to review its details.</div>
          )}
        </div>
      </div>

      <div className="review__mobile" aria-live="polite">
        {filteredApplications.length ? (
          filteredApplications.map((app) => (
            <article key={app.id} className="review-card">
              <div className="review-card__header">
                <div>
                  <h2>{app.name}</h2>
                  <p className="review-card__meta">Submitted {new Date(app.createdAt).toLocaleString()}</p>
                </div>
                <label className="review-card__status">
                  <span className="review-card__status-label">Status</span>
                  <select
                    className={`combo combo--${app.status}`}
                    value={app.status}
                    onChange={(event) => handleInlineStatusChange(app.id, event.target.value)}
                    aria-label={`Update status for ${app.name}`}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <dl className="review-card__grid">
                <div>
                  <dt>Email</dt>
                  <dd>{app.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{app.phone}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{app.age ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt>Stake</dt>
                  <dd>{app.stake}</dd>
                </div>
                <div>
                  <dt>Ward</dt>
                  <dd>{app.ward}</dd>
                </div>
                <div>
                  <dt>Gender</dt>
                  <dd>{app.gender ?? 'N/A'}</dd>
                </div>
              </dl>

              <div className="review-card__notes">
                <h3>Additional Information</h3>
                <p>{app.moreInfo || 'No additional information provided.'}</p>
              </div>
            </article>
          ))
        ) : (
          <p className="review__empty">No applications found for this tab.</p>
        )}
      </div>
    </section>
  );
};

export default AdminReview;
