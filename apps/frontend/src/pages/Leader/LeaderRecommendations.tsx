import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';
import type { Application, LeaderRecommendation, RecommendationStatus } from '@vibe-apply/shared';
import {
  Button,
  ComboBox,
  StatusChip,
  Tabs,
  TextField,
} from '../../components/ui';
import './LeaderRecommendations.scss';

interface RecommendationForm {
  id: string | null;
  name: string;
  age: string;
  email: string;
  phone: string;
  gender: string;
  stake: string;
  ward: string;
  moreInfo: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface LocationState {
  action?: string;
}

interface TabItem {
  id: string;
  label: string;
}

interface GenderOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ExtendedRecommendation extends LeaderRecommendation {
  hasApplication?: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface ExtendedApplication extends Application {
  isApplication: boolean;
}

type CombinedItem = ExtendedRecommendation | ExtendedApplication;

const emptyForm: RecommendationForm = {
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

const TAB_DEFS: TabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'submitted', label: 'Awaiting Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const genderOptions: GenderOption[] = [
  { value: '', label: 'Select gender', disabled: true },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const LeaderRecommendations = () => {
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

  useEffect(() => {
    refetchApplications();
    refetchRecommendations();
  }, [refetchApplications, refetchRecommendations]);

  const [activeTab, setActiveTab] = useState('all');
  const [currentFormId, setCurrentFormId] = useState<string | null | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingOriginStatus, setEditingOriginStatus] = useState<RecommendationStatus | null>(null);
  const [form, setForm] = useState<RecommendationForm>(emptyForm);
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

  const applicantsInStake = useMemo(() => {
    const linkedApplicationIds = new Set(
      recommendations
        .filter((rec) => rec.linkedApplicationId)
        .map((rec) => rec.linkedApplicationId)
    );

    const filtered = applications.filter((app) => {
      const notRecommended = !linkedApplicationIds.has(app.id);
      return notRecommended;
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [applications, recommendations]);

  const combinedItems = useMemo(() => {
    const applicationById = new Map<string, Application>();
    applications
      .filter((app) => app.stake.toLowerCase() === currentUser?.stake.toLowerCase())
      .forEach((app) => {
        applicationById.set(app.id, app);
      });

    const mappedRecommendations: ExtendedRecommendation[] = recommendations.map((rec) => {
      const canModify = rec.status !== 'approved' && rec.status !== 'rejected';
      return {
        ...rec,
        hasApplication: rec.linkedApplicationId ? applicationById.has(rec.linkedApplicationId) : false,
        canEdit: canModify,
        canDelete: canModify,
      };
    });

    const mappedApplications: ExtendedApplication[] = applicantsInStake.map((app) => ({
      ...app,
      isApplication: true,
    }));

    return [...mappedRecommendations, ...mappedApplications].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [recommendations, applicantsInStake, applications, currentUser]);

  const filteredRecommendations = useMemo(() => {
    if (activeTab === 'all') {
      return combinedItems;
    }
    if (activeTab === 'submitted') {
      return combinedItems.filter((item) => {
        if ('isApplication' in item && item.isApplication) {
          return 'status' in item && item.status === 'awaiting';
        }
        return 'status' in item && item.status === 'submitted';
      });
    }
    return combinedItems.filter((item) => !('isApplication' in item && item.isApplication) && 'status' in item && item.status === activeTab);
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
      setForm({
        ...emptyForm,
        stake: currentUser?.stake || '',
        ward: currentUser?.role === 'bishop' ? currentUser?.ward || '' : '',
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
    })
      .then(() => {
        setFeedback(`${application.name} has been recommended for review.`);
      })
      .catch((error) => {
        setFormError((error as Error).message || 'Failed to recommend applicant.');
      });
  };

  const handleSelect = (recommendationId: string) => {
    setSelectedId(recommendationId);
  };

  const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      nextErrors.name = 'Name is required.';
    }
    if (
      Number.isNaN(normalizedAge) ||
      normalizedAge < 16 ||
      normalizedAge > 120
    ) {
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

    if (status === 'submitted' && Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError('Please resolve the highlighted fields before submitting.');
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
      status,
    })
      .then(() => {
        setFeedback(
          status === 'submitted'
            ? 'Recommendation submitted for review.'
            : 'Draft saved successfully.'
        );
        setCurrentFormId(undefined);
      })
      .catch((error) => {
        setFormError((error as Error).message || 'Failed to save recommendation.');
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
      recommendation.status === 'approved' ||
      recommendation.status === 'rejected'
    ) {
      return;
    }
    const confirmed = window.confirm(
      'Are you sure you want to delete this recommendation? This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }
    deleteLeaderRecommendation(leaderId, recommendationId)
      .then(() => {
        setFeedback('Recommendation removed.');
        if (currentFormId === recommendationId) {
          setCurrentFormId(undefined);
        }
        if (selectedId === recommendationId) {
          setSelectedId(null);
        }
      })
      .catch((error) => {
        setFormError((error as Error).message || 'Failed to delete recommendation.');
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
      status: 'submitted' as RecommendationStatus,
    })
      .then(() => {
        setFeedback('Recommendation submitted for review.');
        setSelectedId(recommendationId);
      })
      .catch((error) => {
        setFormError((error as Error).message || 'Failed to submit recommendation.');
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
      recommendation.status === 'approved' ||
      recommendation.status === 'rejected'
    ) {
      return;
    }
    const confirmed = window.confirm(
      'Cancel submission and move this recommendation back to draft? You can edit and resubmit it later.'
    );
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
      status: 'draft' as RecommendationStatus,
    })
      .then(() => {
        setFeedback('Recommendation moved back to draft.');
        setSelectedId(recommendationId);
      })
      .catch((error) => {
        setFormError((error as Error).message || 'Failed to cancel submission.');
      });
  };

  const handleModify = (recommendationId: string) => {
    const recommendation = recommendations.find(
      (item) => item.id === recommendationId
    );
    if (!recommendation || !leaderId) {
      return;
    }

    console.log(
      '[DEBUG] handleModify - recommendation.status:',
      recommendation.status,
      'type:',
      typeof recommendation.status
    );

    if (
      recommendation.status === 'approved' ||
      recommendation.status === 'rejected'
    ) {
      console.log(
        '[DEBUG] handleModify - BLOCKED: status is approved or rejected'
      );
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

  const renderListItem = (item: CombinedItem) => {
    const isSelected = selectedId === item.id;
    const isActive = currentFormId === item.id;
    const listItemClassName = clsx(
      'review__list-item',
      (isSelected || isActive) && 'review__list-item--active'
    );

    const dateToShow = item.updatedAt || item.createdAt;

    return (
      <button
        type='button'
        className={listItemClassName}
        onClick={() => handleSelect(item.id)}
        aria-current={isSelected ? 'true' : 'false'}
      >
        <div className='review__list-top'>
          <span className='review__list-name'>{item.name}</span>
          {'isApplication' in item && item.isApplication ? (
            <StatusChip status={'status' in item ? item.status : 'awaiting'} />
          ) : (
            <StatusChip status={'status' in item ? item.status : 'draft'} />
          )}
        </div>
        <div className='review__list-bottom'>
          <span className='review__list-meta'>{item.stake}</span>
          <span className='review__list-meta'>{item.ward}</span>
          <span className='review__list-meta review__list-date'>
            {new Date(dateToShow).toLocaleDateString()}
          </span>
          <div className='review__list-tags'>
            {!('isApplication' in item && item.isApplication) && (
              <span className='review__list-tag review__list-tag--recommendation'>
                Recommended
              </span>
            )}
            {'isApplication' in item && item.isApplication && (
              <span className='review__list-tag review__list-tag--application'>
                Applied
              </span>
            )}
            {!('isApplication' in item && item.isApplication) && 'hasApplication' in item && item.hasApplication && (
              <span className='review__list-tag review__list-tag--application'>
                Applied
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderForm = (variant: 'desktop' | 'mobile' = 'desktop') => (
    <form
      className={clsx(
        'leader-recommendations__form',
        variant === 'mobile' && 'leader-recommendations__form--mobile'
      )}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmitDraft('submitted' as RecommendationStatus);
      }}
    >
      {editingOriginStatus === 'submitted' && (
        <p className='leader-recommendations__alert'>
          This recommendation is currently submitted. Save as draft or resubmit
          after making updates.
        </p>
      )}
      {formError && (
        <p className='leader-recommendations__alert leader-recommendations__alert--error'>
          {formError}
        </p>
      )}
      <div className='leader-recommendations__grid'>
        <TextField
          name='name'
          label='Applicant Name'
          value={form.name}
          onChange={handleFormChange}
          required
          error={errors.name}
        />
        <TextField
          name='age'
          label='Age'
          type='number'
          value={form.age}
          onChange={handleFormChange}
          required
          error={errors.age}
          min={16}
          max={120}
        />
        <TextField
          name='email'
          label='Email'
          type='email'
          value={form.email}
          onChange={handleFormChange}
          required
          error={errors.email}
        />
        <TextField
          name='phone'
          label='Phone'
          type='tel'
          value={form.phone}
          onChange={handleFormChange}
          required
          error={errors.phone}
        />
        <TextField
          name='stake'
          label='Stake'
          value={form.stake}
          onChange={handleFormChange}
          required
          error={errors.stake}
          disabled
        />
        <TextField
          name='ward'
          label='Ward'
          value={form.ward}
          onChange={handleFormChange}
          required
          error={errors.ward}
          disabled={currentUser?.role === 'bishop'}
        />
        <ComboBox
          name='gender'
          label='Gender (optional)'
          value={form.gender}
          onChange={handleFormChange}
          showRequiredIndicator={false}
          error={errors.gender}
          options={genderOptions}
          variant='default'
        />
      </div>
      <TextField
        name='moreInfo'
        label='Additional Information'
        value={form.moreInfo}
        onChange={handleFormChange}
        placeholder='Share any context or strengths that make this applicant a great fit.'
        multiline
        rows={4}
        wrapperClassName='leader-recommendations__form-full'
        showRequiredIndicator={false}
      />
      <div
        className={clsx(
          'leader-recommendations__actions',
          variant === 'mobile' && 'leader-recommendations__actions--mobile'
        )}
      >
        <Button
          type='submit'
          variant='primary'
          className='leader-recommendations__btn'
        >
          Submit Recommendation
        </Button>
        <Button
          type='button'
          onClick={() => handleSubmitDraft('draft' as RecommendationStatus)}
          className='leader-recommendations__btn'
        >
          Save Draft
        </Button>
        <Button
          type='button'
          variant='danger'
          onClick={handleCancelEdit}
          className='leader-recommendations__btn'
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  const renderDesktopDetails = () => {
    if (isEditing) {
      return (
        <div className='review__details-card leader-recommendations__form-card'>
          {renderForm()}
        </div>
      );
    }

    if (selectedItem) {
      if ('isApplication' in selectedItem && selectedItem.isApplication) {
        return (
          <div className='review__details-card'>
            <header className='review__details-header'>
              <div className='review__details-info'>
                <div className='review__details-heading'>
                  <h2>{selectedItem.name}</h2>
                </div>
                <p className='review__details-meta'>
                  Application submitted{' '}
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusChip status={'status' in selectedItem ? selectedItem.status : 'awaiting'} />
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
            <div className='leader-recommendations__detail-actions'>
              <Button
                type='button'
                variant='primary'
                onClick={() => handleRecommendApplicant(selectedItem as Application)}
                className='leader-recommendations__btn'
              >
                Recommend
              </Button>
            </div>
          </div>
        );
      }

      const updatedLabel = `Updated ${new Date(selectedItem.updatedAt).toLocaleString()}`;
      const canModify = 'canEdit' in selectedItem && selectedItem.canEdit && 'canDelete' in selectedItem && selectedItem.canDelete;

      return (
        <div className='review__details-card'>
          <header className='review__details-header'>
            <div className='review__details-info'>
              <div className='review__details-heading'>
                <h2>{selectedItem.name}</h2>
                <div className='review__details-tags'>
                  <span className='review__details-tag review__details-tag--recommendation'>
                    Recommended
                  </span>
                  {'hasApplication' in selectedItem && selectedItem.hasApplication && (
                    <span className='review__details-tag review__details-tag--application'>
                      Applied
                    </span>
                  )}
                </div>
              </div>
              <p className='review__details-meta'>{updatedLabel}</p>
            </div>
            {'status' in selectedItem && selectedItem.status && <StatusChip status={selectedItem.status} />}
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
              {selectedItem.moreInfo || 'No additional information provided.'}
            </p>
          </div>
          <div className='leader-recommendations__detail-actions'>
            {canModify && (
              <>
                <Button
                  type='button'
                  onClick={() => handleModify(selectedItem.id)}
                  className='leader-recommendations__btn'
                >
                  Modify
                </Button>
                {'status' in selectedItem && selectedItem.status === 'draft' ? (
                  <Button
                    type='button'
                    variant='primary'
                    onClick={() => handleQuickSubmit(selectedItem.id)}
                    className='leader-recommendations__btn'
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    type='button'
                    onClick={() => handleCancelSubmission(selectedItem.id)}
                    className='leader-recommendations__btn'
                  >
                    Cancel Submission
                  </Button>
                )}
                <Button
                  type='button'
                  variant='danger'
                  onClick={() => handleDelete(selectedItem.id)}
                  className='leader-recommendations__btn'
                >
                  Delete
                </Button>
              </>
            )}
            {!canModify && (
              <p className='leader-recommendations__locked-message'>
                This recommendation has been reviewed and is now locked. You can
                no longer modify or delete it.
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className='review__placeholder'>
        Select a recommendation to review its details.
      </div>
    );
  };

  const renderMobileCard = (item: CombinedItem) => {
    if ('isApplication' in item && item.isApplication) {
      return (
        <article
          key={item.id}
          className='review-card leader-recommendations__mobile-card'
        >
          <div className='review-card__header'>
            <div>
              <h2>{item.name}</h2>
              <p className='review-card__meta'>
                Submitted {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <StatusChip status={'status' in item ? item.status : 'awaiting'} />
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
          <div className='leader-recommendations__card-actions'>
              <Button
                type='button'
                variant='primary'
                onClick={() => handleRecommendApplicant(item as Application)}
                className='leader-recommendations__btn'
              >
                Recommend
              </Button>
          </div>
        </article>
      );
    }

    const isEditingThis = currentFormId === item.id;

    return (
      <article
        key={item.id}
        className={clsx(
          'review-card',
          'leader-recommendations__mobile-card',
          isEditingThis && 'leader-recommendations__mobile-card--editing'
        )}
      >
        <div className='review-card__header'>
          <div>
            <h2>{item.name}</h2>
            <p className='review-card__meta'>
              Updated {new Date(item.updatedAt).toLocaleString()}
            </p>
          </div>
          {'status' in item && <StatusChip status={item.status} />}
        </div>
        <div className='review-card__tags'>
          <span className='review-card__tag review-card__tag--recommendation'>
            Recommended
          </span>
          {'hasApplication' in item && item.hasApplication && (
            <span className='review-card__tag review-card__tag--application'>
              Applied
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
        <div className='leader-recommendations__card-actions'>
          {'canEdit' in item && item.canEdit && 'canDelete' in item && item.canDelete ? (
            <>
              <Button
                type='button'
                onClick={() => handleModify(item.id)}
                className='leader-recommendations__btn'
              >
                Modify
              </Button>
              {'status' in item && item.status === 'draft' ? (
                <Button
                  type='button'
                  variant='primary'
                  onClick={() => handleQuickSubmit(item.id)}
                  className='leader-recommendations__btn'
                >
                  Submit
                </Button>
              ) : (
                <Button
                  type='button'
                  onClick={() => handleCancelSubmission(item.id)}
                  className='leader-recommendations__btn'
                >
                  Cancel Submission
                </Button>
              )}
              <Button
                type='button'
                variant='danger'
                onClick={() => handleDelete(item.id)}
                className='leader-recommendations__btn'
              >
                Delete
              </Button>
            </>
          ) : (
            <p className='leader-recommendations__locked-message'>
              This recommendation has been reviewed and is now locked. You can
              no longer modify or delete it.
            </p>
          )}
        </div>
        {isEditingThis && (
          <p className='leader-recommendations__editing-banner'>
            Editing this recommendation above. Submit or save your changes when
            ready.
          </p>
        )}
      </article>
    );
  };

  return (
    <section className='review leader-recommendations'>
      <div className='review__header'>
        <div className='review__header-copy'>
          <h1 className='review__title'>Recommendations</h1>
          <p className='review__subtitle'>
            Manage drafts and submitted recommendations. Update details and
            resubmit when ready.
          </p>
        </div>
        <Button type='button' variant='primary' onClick={handleCreate}>
          Create Recommendation
        </Button>
      </div>

      {feedback && <p className='leader-recommendations__banner'>{feedback}</p>}

      <Tabs
        items={TAB_DEFS}
        activeId={activeTab}
        onChange={(_, tab) => handleTabChange(tab.id)}
        className='review__tabs'
        tabClassName='review__tab'
        activeTabClassName='review__tab--active'
        labelClassName='review__tab-label'
        badgeClassName='review__tab-pill'
        ariaLabel='Recommendation status filters'
        getBadge={(tab) =>
          combinedItems.filter((item) => {
            if (tab.id === 'all') return true;
            if (tab.id === 'submitted') {
              if ('isApplication' in item && item.isApplication) {
                return 'status' in item && item.status === 'awaiting';
              }
              return 'status' in item && item.status === 'submitted';
            }
            return !('isApplication' in item && item.isApplication) && 'status' in item && item.status === tab.id;
          }).length
        }
      />

      <div className='review__body'>
        <aside className='review__list'>
          {listRecommendations.length ? (
            <ul>
              {listRecommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  {renderListItem(recommendation)}
                </li>
              ))}
            </ul>
          ) : (
            <p className='review__empty'>
              No recommendations in this view yet.
            </p>
          )}
        </aside>

        <div
          className='review__details leader-recommendations__details'
          aria-live='polite'
        >
          {renderDesktopDetails()}
        </div>
      </div>

      <div className='review__mobile' aria-live='polite'>
        {isEditing && (
          <article className='review-card leader-recommendations__mobile-form'>
            {renderForm('mobile')}
          </article>
        )}
        {filteredRecommendations.length ? (
          filteredRecommendations.map((item) => renderMobileCard(item))
        ) : (
          <p className='review__empty'>No recommendations in this view yet.</p>
        )}
      </div>
    </section>
  );
};

export default LeaderRecommendations;
