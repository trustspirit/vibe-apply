import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from '../../utils/classNames.js';
import { useApp } from '../../context/AppContext.jsx';
import { Button, ComboBox, StatusChip, Tabs, TextField } from '../../components/ui';
import './LeaderRecommendations.scss';

const emptyForm = {
  id: null,
  name: '',
  age: '',
  email: '',
  phone: '',
  gender: '',
  stake: '',
  ward: '',
  moreInfo: '',
};

const TAB_DEFS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'draft', label: 'Draft' },
];

const genderOptions = [
  { value: '', label: 'Select gender', disabled: true },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const LeaderRecommendations = () => {
  const { state } = useLocation();
  const { currentUser, leaderRecommendations, submitLeaderRecommendation, deleteLeaderRecommendation } = useApp();
  const leaderId = currentUser?.id ?? null;

  const [activeTab, setActiveTab] = useState('all');
  const [currentFormId, setCurrentFormId] = useState(undefined);
  const [selectedId, setSelectedId] = useState(null);
  const [editingOriginStatus, setEditingOriginStatus] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (state?.action === 'create') {
      setCurrentFormId(null);
      setSelectedId(null);
    }
  }, [state]);

  const recommendations = useMemo(
    () =>
      leaderRecommendations
        .filter((recommendation) => recommendation.leaderId === leaderId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [leaderRecommendations, leaderId],
  );

  const filteredRecommendations = useMemo(() => {
    if (activeTab === 'all') {
      return recommendations;
    }
    return recommendations.filter((recommendation) => recommendation.status === activeTab);
  }, [recommendations, activeTab]);

  const listRecommendations = filteredRecommendations;

  useEffect(() => {
    const containsPrevSelected = filteredRecommendations.some((recommendation) => recommendation.id === selectedId);
    if (!containsPrevSelected) {
      const nextId = filteredRecommendations[0]?.id ?? null;
      setSelectedId(nextId);
    }

    if (currentFormId && !filteredRecommendations.some((recommendation) => recommendation.id === currentFormId)) {
      setCurrentFormId(undefined);
    }
  }, [filteredRecommendations, selectedId, currentFormId]);

  const isEditing = currentFormId !== undefined;
  const activeRecommendation =
    currentFormId && currentFormId !== null
      ? recommendations.find((recommendation) => recommendation.id === currentFormId) ?? null
      : null;
  const selectedRecommendation = selectedId
    ? recommendations.find((recommendation) => recommendation.id === selectedId) ?? null
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
      setForm(emptyForm);
      setErrors({});
      setFormError('');
      setEditingOriginStatus(null);
      return;
    }

    const recommendation = recommendations.find((item) => item.id === currentFormId);
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
      });
      setErrors({});
      setFormError('');
    } else {
      setCurrentFormId(undefined);
    }
  }, [currentFormId, recommendations]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleCreate = () => {
    setCurrentFormId(null);
    setSelectedId(null);
    setFeedback('');
  };

  const handleSelect = (recommendationId) => {
    setSelectedId(recommendationId);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    const nextErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedStake = form.stake.trim();
    const trimmedWard = form.ward.trim();
    const normalizedAge = Number.parseInt(form.age, 10);
    const normalizedGender = form.gender === 'male' || form.gender === 'female' ? form.gender : '';

    if (!trimmedName) {
      nextErrors.name = 'Name is required.';
    }
    if (Number.isNaN(normalizedAge) || normalizedAge < 16 || normalizedAge > 120) {
      nextErrors.age = 'Age must be between 16 and 120.';
    }
    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!trimmedPhone) {
      nextErrors.phone = 'Phone number is required.';
    }
    if (!trimmedStake) {
      nextErrors.stake = 'Stake is required.';
    }
    if (!trimmedWard) {
      nextErrors.ward = 'Ward is required.';
    }
    if (!normalizedGender) {
      nextErrors.gender = 'Select male or female.';
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

  const handleSubmitDraft = (status) => {
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

    if (status === 'submitted' && Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError('Please resolve the highlighted fields before submitting.');
      return;
    }

    submitLeaderRecommendation(leaderId, {
      id: form.id,
      status,
      name: trimmedName,
      age: Number.isNaN(normalizedAge) ? null : normalizedAge,
      email: trimmedEmail,
      phone: trimmedPhone,
      gender: normalizedGender || form.gender,
      stake: trimmedStake,
      ward: trimmedWard,
      moreInfo: form.moreInfo.trim(),
    });

    setFeedback(status === 'submitted' ? 'Recommendation submitted for review.' : 'Draft saved successfully.');
    setCurrentFormId(undefined);
  };

  const handleDelete = (recommendationId) => {
    if (!leaderId) {
      return;
    }
    const confirmed = window.confirm('Are you sure you want to delete this recommendation? This action cannot be undone.');
    if (!confirmed) {
      return;
    }
    deleteLeaderRecommendation(leaderId, recommendationId);
    setFeedback('Recommendation removed.');
    if (currentFormId === recommendationId) {
      setCurrentFormId(undefined);
    }
    if (selectedId === recommendationId) {
      setSelectedId(null);
    }
  };

  const handleQuickSubmit = (recommendationId) => {
    if (!leaderId) {
      return;
    }
    const recommendation = recommendations.find((item) => item.id === recommendationId);
    if (!recommendation) {
      return;
    }
    submitLeaderRecommendation(leaderId, {
      id: recommendation.id,
      status: 'submitted',
      name: recommendation.name,
      age: recommendation.age ?? null,
      email: recommendation.email,
      phone: recommendation.phone,
      gender: recommendation.gender ?? '',
      stake: recommendation.stake,
      ward: recommendation.ward,
      moreInfo: recommendation.moreInfo ?? '',
    });
    setFeedback('Recommendation submitted for review.');
    setSelectedId(recommendationId);
  };

  const handleCancelSubmission = (recommendationId) => {
    if (!leaderId) {
      return;
    }
    const recommendation = recommendations.find((item) => item.id === recommendationId);
    if (!recommendation) {
      return;
    }
    const confirmed = window.confirm(
      'Cancel submission and move this recommendation back to draft? You can edit and resubmit it later.',
    );
    if (!confirmed) {
      return;
    }
    submitLeaderRecommendation(leaderId, {
      id: recommendation.id,
      status: 'draft',
      name: recommendation.name,
      age: recommendation.age ?? null,
      email: recommendation.email,
      phone: recommendation.phone,
      gender: recommendation.gender ?? '',
      stake: recommendation.stake,
      ward: recommendation.ward,
      moreInfo: recommendation.moreInfo ?? '',
    });
    setFeedback('Submission cancelled. The recommendation is now a draft.');
    setSelectedId(recommendationId);
  };

  const handleModify = (recommendationId) => {
    const recommendation = recommendations.find((item) => item.id === recommendationId);
    if (!recommendation || !leaderId) {
      return;
    }

    setEditingOriginStatus(recommendation.status);

    if (recommendation.status === 'submitted') {
      const confirmed = window.confirm(
        'Modifying this submitted recommendation will move it back to draft. You will need to submit it again after making changes. Continue?',
      );
      if (!confirmed) {
        setEditingOriginStatus(null);
        return;
      }

      submitLeaderRecommendation(leaderId, {
        id: recommendation.id,
        status: 'draft',
        name: recommendation.name,
        age: recommendation.age ?? null,
        email: recommendation.email,
        phone: recommendation.phone,
        gender: recommendation.gender ?? '',
        stake: recommendation.stake,
        ward: recommendation.ward,
        moreInfo: recommendation.moreInfo ?? '',
      });
    setFeedback('This recommendation has been moved back to draft. Submit again once updates are complete.');
  }

  setCurrentFormId(recommendationId);
  setSelectedId(recommendationId);
  };

  const handleCancelEdit = () => {
    setCurrentFormId(undefined);
  };

  const renderCard = (recommendation) => {
    const isSelected = selectedId === recommendation.id;
    const isActive = currentFormId === recommendation.id;
    const cardClassName = classNames(
      'leader-recommendations__card',
      isSelected && 'leader-recommendations__card--selected',
      isActive && 'leader-recommendations__card--active',
    );

    return (
      <button
        key={recommendation.id}
        type="button"
        className="leader-recommendations__card-button"
        onClick={() => handleSelect(recommendation.id)}
      >
        <article className={cardClassName}>
          <div className="leader-recommendations__card-header">
            <div>
              <h3>{recommendation.name}</h3>
              <span className="leader-recommendations__card-meta">
                {recommendation.stake} • {recommendation.ward}
              </span>
            </div>
            <StatusChip status={recommendation.status} className="leader-recommendations__status-chip" />
          </div>
          {isActive && <p className="leader-recommendations__editing-indicator">Editing…</p>}
          <dl className="leader-recommendations__card-details">
            <div>
              <dt>Phone</dt>
              <dd>{recommendation.phone}</dd>
            </div>
          <div>
            <dt>Stake</dt>
            <dd>{recommendation.stake}</dd>
          </div>
          <div>
            <dt>Ward</dt>
            <dd>{recommendation.ward}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{recommendation.gender ?? 'N/A'}</dd>
          </div>
          <div>
            <dt>Age</dt>
            <dd>{recommendation.age ?? 'N/A'}</dd>
          </div>
        </dl>
        {recommendation.moreInfo ? (
          <p className="leader-recommendations__card-notes">{recommendation.moreInfo}</p>
        ) : null}
        </article>
      </button>
    );
  };

  return (
    <section className="leader-recommendations">
      <header className="leader-recommendations__header">
        <div className="leader-recommendations__intro">
          <h1 className="leader-recommendations__title">My Recommendations</h1>
          <p className="leader-recommendations__subtitle">
            Manage drafts and submitted recommendations. Update details and resubmit when ready.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={handleCreate}>
          Create Recommendation
        </Button>
      </header>

      {feedback && <p className="leader-recommendations__banner">{feedback}</p>}

      <Tabs
        items={TAB_DEFS}
        activeId={activeTab}
        onChange={(_, tab) => handleTabChange(tab.id)}
        className="leader-recommendations__tabs"
        tabClassName="leader-recommendations__tab"
        activeTabClassName="leader-recommendations__tab--active"
        labelClassName="leader-recommendations__tab-label"
        badgeClassName="leader-recommendations__tab-pill"
        ariaLabel="Recommendation status filters"
        getBadge={(tab) =>
          recommendations.filter((recommendation) =>
            tab.id === 'all' ? true : recommendation.status === tab.id,
          ).length
        }
      />

      <div
        className={classNames(
          'leader-recommendations__content',
          isEditing && 'leader-recommendations__content--editing',
          !isEditing && selectedRecommendation && 'leader-recommendations__content--detail',
        )}
      >
        <aside className="leader-recommendations__list" role="complementary">
          {listRecommendations.length ? (
            <ul>
              {listRecommendations.map((recommendation) => (
                <li key={recommendation.id}>{renderCard(recommendation)}</li>
              ))}
            </ul>
          ) : (
            <p className="leader-recommendations__empty">No recommendations in this view yet.</p>
          )}
        </aside>

        {isEditing && (
          <div className="leader-recommendations__form-wrapper">
            <form className="leader-recommendations__form" onSubmit={(event) => {
              event.preventDefault();
              handleSubmitDraft('submitted');
            }}>
              {editingOriginStatus === 'submitted' && (
                <p className="leader-recommendations__alert">
                  This recommendation was previously submitted. It is now a draft and must be submitted again for
                  review after changes.
                </p>
              )}
              {formError && (
                <p className="leader-recommendations__alert leader-recommendations__alert--error">{formError}</p>
              )}
              <div className="leader-recommendations__grid">
                <TextField
                  name="name"
                  label="Applicant Name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  error={errors.name}
                />
                <TextField
                  name="age"
                  label="Age"
                  type="number"
                  value={form.age}
                  onChange={handleFormChange}
                  required
                  error={errors.age}
                  min={16}
                  max={120}
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  error={errors.email}
                />
                <TextField
                  name="phone"
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFormChange}
                  required
                  error={errors.phone}
                />
                <TextField
                  name="stake"
                  label="Stake"
                  value={form.stake}
                  onChange={handleFormChange}
                  required
                  error={errors.stake}
                />
                <TextField
                  name="ward"
                  label="Ward"
                  value={form.ward}
                  onChange={handleFormChange}
                  required
                  error={errors.ward}
                />
                <ComboBox
                  name="gender"
                  label="Gender"
                  value={form.gender}
                  onChange={handleFormChange}
                  error={errors.gender}
                  options={genderOptions}
                  variant="input"
                />
              </div>
              <TextField
                name="moreInfo"
                label="Additional Information"
                value={form.moreInfo}
                onChange={handleFormChange}
                placeholder="Share any context or strengths that make this applicant a great fit."
                multiline
                rows={4}
                wrapperClassName="leader-recommendations__form-full"
                showRequiredIndicator={false}
              />
              <div className="leader-recommendations__actions">
                <Button type="submit" variant="primary" className="leader-recommendations__btn">
                  Submit Recommendation
                </Button>
                <Button type="button" onClick={() => handleSubmitDraft('draft')} className="leader-recommendations__btn">
                  Save Draft
                </Button>
                <Button type="button" variant="danger" onClick={handleCancelEdit} className="leader-recommendations__btn">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {!isEditing && selectedRecommendation && (
          <div className="leader-recommendations__detail">
            <div className="leader-recommendations__detail-header">
              <div className="leader-recommendations__detail-info">
                <h2>{selectedRecommendation.name}</h2>
                <div className="leader-recommendations__detail-meta">
                  <span className="leader-recommendations__detail-email">{selectedRecommendation.email}</span>
                  <span className="leader-recommendations__detail-separator" aria-hidden>
                    •
                  </span>
                  <span className="leader-recommendations__detail-date">
                    Updated {new Date(selectedRecommendation.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <StatusChip
                status={selectedRecommendation.status}
                className="leader-recommendations__status-chip"
              />
            </div>
            <dl className="leader-recommendations__detail-grid">
              <div>
                <dt>Phone</dt>
                <dd>{selectedRecommendation.phone}</dd>
              </div>
              <div>
                <dt>Stake</dt>
                <dd>{selectedRecommendation.stake}</dd>
              </div>
              <div>
                <dt>Ward</dt>
                <dd>{selectedRecommendation.ward}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{selectedRecommendation.gender ?? 'N/A'}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{selectedRecommendation.age ?? 'N/A'}</dd>
              </div>
            </dl>
            {selectedRecommendation.moreInfo ? (
              <p className="leader-recommendations__detail-notes">{selectedRecommendation.moreInfo}</p>
            ) : (
              <p className="leader-recommendations__detail-notes">No additional information provided.</p>
            )}
            <div className="leader-recommendations__detail-actions">
              <Button
                type="button"
                onClick={() => handleModify(selectedRecommendation.id)}
                className="leader-recommendations__btn"
              >
                Modify
              </Button>
              {selectedRecommendation.status === 'draft' ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleQuickSubmit(selectedRecommendation.id)}
                  className="leader-recommendations__btn"
                >
                  Submit
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleCancelSubmission(selectedRecommendation.id)}
                  className="leader-recommendations__btn"
                >
                  Cancel Submission
                </Button>
              )}
              <Button
                type="button"
                variant="danger"
                onClick={() => handleDelete(selectedRecommendation.id)}
                className="leader-recommendations__btn"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LeaderRecommendations;
