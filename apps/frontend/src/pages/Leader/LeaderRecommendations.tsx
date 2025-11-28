import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { Application, LeaderRecommendation, RecommendationStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import {
  Button,
  ComboBox,
  DetailsGrid,
  DetailsGridItem,
  DetailsNotes,
  StatusChip,
  Tabs,
  TextField,
  ToggleButton,
} from '@/components/ui';
import { AGE_MIN, AGE_MAX, AGE_ERROR_MESSAGE } from '@/utils/validationConstants';
import { CONFIRMATION_MESSAGES } from '@/utils/formConstants';
import type { ValidationErrors, TabItem } from '@/types';
import styles from './LeaderRecommendations.module.scss';

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
  servedMission: boolean;
}

interface LocationState {
  action?: string;
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
      .then(() => {
        setFeedback(t('leader.recommendations.messages.recommended', { name: application.name }));
      })
      .catch((error) => {
        setFormError((error as Error).message || t('leader.recommendations.messages.failedToRecommend'));
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

    if (status === 'submitted' && Object.keys(nextErrors).length) {
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
          status === 'submitted'
            ? t('leader.recommendations.messages.submitted')
            : t('leader.recommendations.messages.draftSaved')
        );
        setCurrentFormId(undefined);
      })
      .catch((error) => {
        setFormError((error as Error).message || t('leader.recommendations.messages.failedToSave'));
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
    const confirmed = window.confirm(CONFIRMATION_MESSAGES.DELETE_RECOMMENDATION);
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
        setFormError((error as Error).message || t('leader.recommendations.messages.failedToDelete'));
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
      status: 'submitted' as RecommendationStatus,
    })
      .then(() => {
        setFeedback(t('leader.recommendations.messages.submitted'));
        setSelectedId(recommendationId);
      })
      .catch((error) => {
        setFormError((error as Error).message || t('leader.recommendations.messages.failedToSubmit'));
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
      status: 'draft' as RecommendationStatus,
    })
      .then(() => {
        setFeedback(t('leader.recommendations.messages.movedToDraft'));
        setSelectedId(recommendationId);
      })
      .catch((error) => {
        setFormError((error as Error).message || t('leader.recommendations.messages.failedToCancel'));
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
      recommendation.status === 'approved' ||
      recommendation.status === 'rejected'
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

  const renderListItem = (item: CombinedItem) => {
    const isSelected = selectedId === item.id;
    const isActive = currentFormId === item.id;
    const listItemClassName = clsx(
      styles.listItem,
      (isSelected || isActive) && styles.listItemActive
    );

    const dateToShow = item.updatedAt || item.createdAt;

    return (
      <button
        type='button'
        className={listItemClassName}
        onClick={() => handleSelect(item.id)}
        aria-current={isSelected ? 'true' : 'false'}
      >
        <div className={styles.listTop}>
          <span className={styles.listName}>{item.name}</span>
          {'isApplication' in item && item.isApplication ? (
            <StatusChip status={'status' in item ? item.status : 'awaiting'} />
          ) : (
            <StatusChip status={'status' in item ? item.status : 'draft'} />
          )}
        </div>
        <div className={styles.listBottom}>
          <span className={styles.listMeta}>{item.stake}</span>
          <span className={styles.listMeta}>{item.ward}</span>
          <span className={clsx(styles.listMeta, styles.listDate)}>
            {new Date(dateToShow).toLocaleDateString()}
          </span>
          <div className={styles.listTags}>
            {!('isApplication' in item && item.isApplication) && (
              <span className={clsx(styles.listTag, styles.listTagRecommendation)}>
                {t('leader.recommendations.tags.recommended')}
              </span>
            )}
            {'isApplication' in item && item.isApplication && (
              <span className={clsx(styles.listTag, styles.listTagApplication)}>
                {t('leader.recommendations.tags.applied')}
              </span>
            )}
            {!('isApplication' in item && item.isApplication) && 'hasApplication' in item && item.hasApplication && (
              <span className={clsx(styles.listTag, styles.listTagApplication)}>
                {t('leader.recommendations.tags.applied')}
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
        <p className={styles.alert}>
          {t('leader.recommendations.form.editingAlert')}
        </p>
      )}
      {formError && (
        <p className={`${styles.alert} ${styles.alertError}`}>
          {formError}
        </p>
      )}
      <div className={styles.grid}>
        <TextField
          name='name'
          label={t('leader.recommendations.form.applicantName')}
          value={form.name}
          onChange={handleFormChange}
          required
          error={errors.name}
        />
        <TextField
          name='age'
          label={t('leader.recommendations.form.age')}
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
          label={t('leader.recommendations.form.email')}
          type='email'
          value={form.email}
          onChange={handleFormChange}
          required
          error={errors.email}
        />
        <TextField
          name='phone'
          label={t('leader.recommendations.form.phone')}
          type='tel'
          value={form.phone}
          onChange={handleFormChange}
          required
          error={errors.phone}
        />
        <TextField
          name='stake'
          label={t('leader.recommendations.form.stake')}
          value={form.stake}
          onChange={handleFormChange}
          required
          error={errors.stake}
          disabled
        />
        <TextField
          name='ward'
          label={t('leader.recommendations.form.ward')}
          value={form.ward}
          onChange={handleFormChange}
          required
          error={errors.ward}
          disabled={currentUser?.role === 'bishop'}
        />
        <ComboBox
          name='gender'
          label={t('leader.recommendations.form.gender')}
          value={form.gender}
          onChange={handleFormChange}
          required
          error={errors.gender}
          options={[
            { value: '', label: t('leader.recommendations.form.genderSelect'), disabled: true },
            { value: 'male', label: t('leader.recommendations.form.genderMale') },
            { value: 'female', label: t('leader.recommendations.form.genderFemale') },
          ]}
          variant='default'
        />
        <div className={styles.toggleWrapper}>
          <label className={styles.toggleLabel}>
            {t('leader.recommendations.form.servedMission')}
            <span className={styles.requiredIndicator}>*</span>
          </label>
          <ToggleButton
            checked={form.servedMission}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, servedMission: value }))
            }
            labelOn={t('common.yes')}
            labelOff={t('common.no')}
          />
          {errors.servedMission && (
            <span className={styles.errorText}>
              {errors.servedMission}
            </span>
          )}
        </div>
      </div>
      <TextField
        name='moreInfo'
        label={t('leader.recommendations.form.additionalInfo')}
        value={form.moreInfo}
        onChange={handleFormChange}
        placeholder={t('leader.recommendations.form.additionalInfoPlaceholder')}
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
          className={styles.btn}
        >
          {t('leader.recommendations.form.submitRecommendation')}
        </Button>
        <Button
          type='button'
          onClick={() => handleSubmitDraft('draft' as RecommendationStatus)}
          className={styles.btn}
        >
          {t('leader.recommendations.form.saveDraft')}
        </Button>
        <Button
          type='button'
          variant='danger'
          onClick={handleCancelEdit}
          className={styles.btn}
        >
          {t('leader.recommendations.form.cancel')}
        </Button>
      </div>
    </form>
  );

  const renderDesktopDetails = () => {
    if (isEditing) {
      return (
        <div className={`${styles.detailsCard} ${styles.formCard}`}>
          {renderForm()}
        </div>
      );
    }

    if (selectedItem) {
      if ('isApplication' in selectedItem && selectedItem.isApplication) {
        return (
          <div className={styles.detailsCard}>
            <header className={styles.detailsHeader}>
              <div className={styles.detailsInfo}>
                <div className={styles.detailsHeading}>
                  <h2>{selectedItem.name}</h2>
                </div>
                <p className={styles.detailsMeta}>
                  {t('leader.recommendations.details.applicationSubmitted')}{' '}
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusChip status={'status' in selectedItem ? selectedItem.status : 'awaiting'} />
            </header>
            <DetailsGrid>
              <DetailsGridItem label={t('common.email')}>
                {selectedItem.email}
              </DetailsGridItem>
              <DetailsGridItem label={t('common.phone')}>
                {selectedItem.phone}
              </DetailsGridItem>
              <DetailsGridItem label={t('leader.recommendations.form.age')}>
                {selectedItem.age ?? t('admin.roles.nA')}
              </DetailsGridItem>
              <DetailsGridItem label={t('common.stake')}>
                {selectedItem.stake}
              </DetailsGridItem>
              <DetailsGridItem label={t('common.ward')}>
                {selectedItem.ward}
              </DetailsGridItem>
              <DetailsGridItem label={t('leader.recommendations.form.gender')}>
                {selectedItem.gender ?? t('admin.roles.nA')}
              </DetailsGridItem>
              {'servedMission' in selectedItem && selectedItem.servedMission !== undefined && (
                <DetailsGridItem label={t('leader.recommendations.form.servedMission')}>
                  {selectedItem.servedMission ? t('common.yes') : t('common.no')}
                </DetailsGridItem>
              )}
            </DetailsGrid>
            {selectedItem.status !== 'approved' && (
              <div className={styles.detailActions}>
                <Button
                  type='button'
                  variant='primary'
                  onClick={() => handleRecommendApplicant(selectedItem as Application)}
                  className={styles.btn}
                >
                  {t('leader.recommendations.actions.recommend')}
                </Button>
              </div>
            )}
          </div>
        );
      }

      const updatedLabel = `${t('leader.recommendations.details.updated')} ${new Date(selectedItem.updatedAt).toLocaleString()}`;
      const canModify = 'canEdit' in selectedItem && selectedItem.canEdit && 'canDelete' in selectedItem && selectedItem.canDelete;

      return (
        <div className={styles.detailsCard}>
          <header className={styles.detailsHeader}>
            <div className={styles.detailsInfo}>
              <div className={styles.detailsHeading}>
                <h2>{selectedItem.name}</h2>
                <div className={styles.detailsTags}>
                  <span className={clsx(styles.detailsTag, styles.detailsTagRecommendation)}>
                    {t('leader.recommendations.tags.recommended')}
                  </span>
                  {'hasApplication' in selectedItem && selectedItem.hasApplication && (
                    <span className={clsx(styles.detailsTag, styles.detailsTagApplication)}>
                      {t('leader.recommendations.tags.applied')}
                    </span>
                  )}
                </div>
              </div>
              <p className={styles.detailsMeta}>{updatedLabel}</p>
            </div>
            {'status' in selectedItem && selectedItem.status && <StatusChip status={selectedItem.status} />}
          </header>
          <DetailsGrid>
            <DetailsGridItem label={t('common.email')}>
              {selectedItem.email}
            </DetailsGridItem>
            <DetailsGridItem label={t('common.phone')}>
              {selectedItem.phone}
            </DetailsGridItem>
            <DetailsGridItem label={t('leader.recommendations.form.age')}>
              {selectedItem.age ?? t('admin.roles.nA')}
            </DetailsGridItem>
            <DetailsGridItem label={t('common.stake')}>
              {selectedItem.stake}
            </DetailsGridItem>
            <DetailsGridItem label={t('common.ward')}>
              {selectedItem.ward}
            </DetailsGridItem>
            <DetailsGridItem label={t('leader.recommendations.form.gender')}>
              {selectedItem.gender ?? t('admin.roles.nA')}
            </DetailsGridItem>
            {'servedMission' in selectedItem && selectedItem.servedMission !== undefined && (
              <DetailsGridItem label={t('leader.recommendations.form.servedMission')}>
                {selectedItem.servedMission ? t('common.yes') : t('common.no')}
              </DetailsGridItem>
            )}
          </DetailsGrid>
          <DetailsNotes title={t('leader.recommendations.details.additionalInfo')}>
            {selectedItem.moreInfo || t('leader.recommendations.details.noAdditionalInfo')}
          </DetailsNotes>
          <div className={styles.detailActions}>
            {canModify && (
              <>
                <Button
                  type='button'
                  onClick={() => handleModify(selectedItem.id)}
                  className={styles.btn}
                >
                  {t('leader.recommendations.actions.modify')}
                </Button>
                {'status' in selectedItem && selectedItem.status === 'draft' ? (
                  <Button
                    type='button'
                    variant='primary'
                    onClick={() => handleQuickSubmit(selectedItem.id)}
                    className={styles.btn}
                  >
                    {t('leader.recommendations.actions.submit')}
                  </Button>
                ) : (
                  <Button
                    type='button'
                    onClick={() => handleCancelSubmission(selectedItem.id)}
                    className={styles.btn}
                  >
                    {t('leader.recommendations.actions.cancelSubmission')}
                  </Button>
                )}
                <Button
                  type='button'
                  variant='danger'
                  onClick={() => handleDelete(selectedItem.id)}
                  className={styles.btn}
                >
                  {t('leader.recommendations.actions.delete')}
                </Button>
              </>
            )}
            {!canModify && (
              <p className={styles.lockedMessage}>
                {t('leader.recommendations.details.lockedMessage')}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.placeholder}>
        {t('leader.recommendations.details.selectRecommendation')}
      </div>
    );
  };

  const renderMobileCard = (item: CombinedItem) => {
    if ('isApplication' in item && item.isApplication) {
      return (
        <article
          key={item.id}
          className={`${styles.reviewCard} ${styles.mobileCard}`}
        >
          <div className={styles.reviewCardHeader}>
            <div>
              <h2>{item.name}</h2>
              <p className={styles.reviewCardMeta}>
                {t('leader.recommendations.details.applicationSubmitted')} {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <StatusChip status={'status' in item ? item.status : 'awaiting'} />
          </div>
          <DetailsGrid className={styles.reviewCardGrid}>
            <DetailsGridItem label={t('common.email')}>
              {item.email}
            </DetailsGridItem>
            <DetailsGridItem label={t('common.phone')}>
              {item.phone}
            </DetailsGridItem>
            <DetailsGridItem label={t('leader.recommendations.form.age')}>
              {item.age ?? t('admin.roles.nA')}
            </DetailsGridItem>
            <DetailsGridItem label={t('common.stake')}>
              {item.stake}
            </DetailsGridItem>
            <DetailsGridItem label={t('common.ward')}>
              {item.ward}
            </DetailsGridItem>
            <DetailsGridItem label={t('leader.recommendations.form.gender')}>
              {item.gender ?? t('admin.roles.nA')}
            </DetailsGridItem>
            {'servedMission' in item && item.servedMission !== undefined && (
              <DetailsGridItem label={t('leader.recommendations.form.servedMission')}>
                {item.servedMission ? t('common.yes') : t('common.no')}
              </DetailsGridItem>
            )}
          </DetailsGrid>
          {item.status !== 'approved' && (
            <div className={styles.cardActions}>
                <Button
                  type='button'
                  variant='primary'
                  onClick={() => handleRecommendApplicant(item as Application)}
                  className={styles.btn}
                >
                  {t('leader.recommendations.actions.recommend')}
                </Button>
            </div>
          )}
        </article>
      );
    }

    const isEditingThis = currentFormId === item.id;

    return (
      <article
        key={item.id}
        className={clsx(
          styles.reviewCard,
          styles.mobileCard,
          isEditingThis && styles.mobileCardEditing
        )}
      >
        <div className={styles.reviewCardHeader}>
          <div>
            <h2>{item.name}</h2>
            <p className={styles.reviewCardMeta}>
              {t('leader.recommendations.details.updated')} {new Date(item.updatedAt).toLocaleString()}
            </p>
          </div>
          {'status' in item && <StatusChip status={item.status} />}
        </div>
        <div className={styles.reviewCardTags}>
          <span className={clsx(styles.reviewCardTag, styles.reviewCardTagRecommendation)}>
            {t('leader.recommendations.tags.recommended')}
          </span>
          {'hasApplication' in item && item.hasApplication && (
            <span className={clsx(styles.reviewCardTag, styles.reviewCardTagApplication)}>
              {t('leader.recommendations.tags.applied')}
            </span>
          )}
        </div>
        <DetailsGrid className={styles.reviewCardGrid}>
          <DetailsGridItem label={t('common.email')}>
            {item.email}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.phone')}>
            {item.phone}
          </DetailsGridItem>
          <DetailsGridItem label={t('leader.recommendations.form.age')}>
            {item.age ?? t('admin.roles.nA')}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.stake')}>
            {item.stake}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.ward')}>
            {item.ward}
          </DetailsGridItem>
          <DetailsGridItem label={t('leader.recommendations.form.gender')}>
            {item.gender ?? t('admin.roles.nA')}
          </DetailsGridItem>
          {'servedMission' in item && item.servedMission !== undefined && (
            <DetailsGridItem label={t('leader.recommendations.form.servedMission')}>
              {item.servedMission ? t('common.yes') : t('common.no')}
            </DetailsGridItem>
          )}
        </DetailsGrid>
        <DetailsNotes
          title={t('leader.recommendations.details.additionalInfo')}
          className={styles.reviewCardNotes}
        >
          {item.moreInfo || t('leader.recommendations.details.noAdditionalInfo')}
        </DetailsNotes>
        <div className={styles.cardActions}>
          {'canEdit' in item && item.canEdit && 'canDelete' in item && item.canDelete ? (
            <>
              <Button
                type='button'
                onClick={() => handleModify(item.id)}
                className={styles.btn}
              >
                {t('leader.recommendations.actions.modify')}
              </Button>
              {'status' in item && item.status === 'draft' ? (
                <Button
                  type='button'
                  variant='primary'
                  onClick={() => handleQuickSubmit(item.id)}
                  className={styles.btn}
                >
                  {t('leader.recommendations.actions.submit')}
                </Button>
              ) : (
                <Button
                  type='button'
                  onClick={() => handleCancelSubmission(item.id)}
                  className={styles.btn}
                >
                  {t('leader.recommendations.actions.cancelSubmission')}
                </Button>
              )}
              <Button
                type='button'
                variant='danger'
                onClick={() => handleDelete(item.id)}
                className={styles.btn}
              >
                {t('leader.recommendations.actions.delete')}
              </Button>
            </>
          ) : (
            <p className={styles.lockedMessage}>
              {t('leader.recommendations.details.lockedMessage')}
            </p>
          )}
        </div>
        {isEditingThis && (
          <p className={styles.mobileEditingNote}>
            {t('leader.recommendations.mobileEditingNote')}
          </p>
        )}
      </article>
    );
  };

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
                return 'status' in item && item.status === 'awaiting';
              }
              return 'status' in item && item.status === 'submitted';
            }
            return !('isApplication' in item && item.isApplication) && 'status' in item && item.status === tab.id;
          }).length
        }
      />

      <div className={styles.body}>
        <aside className={styles.list}>
          {listRecommendations.length ? (
            <ul>
              {listRecommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  {renderListItem(recommendation)}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              {t('leader.recommendations.empty')}
            </p>
          )}
        </aside>

        <div
          className={styles.details}
          aria-live='polite'
        >
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
          filteredRecommendations.map((item) => renderMobileCard(item))
        ) : (
          <p className={styles.empty}>{t('leader.recommendations.empty')}</p>
        )}
      </div>
    </section>
  );
};

export default LeaderRecommendations;
