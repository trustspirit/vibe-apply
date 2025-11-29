import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { applicationsApi } from '@/services/api';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  ComboBox,
  StakeWardSelector,
  StatusChip,
  SummaryItem,
  TextField,
  ToggleButton,
} from '@/components/ui';
import { ApplicationStatus } from '@vibe-apply/shared';
import {
  validateEmail,
  validateAge,
  validateRequired,
  validateGender,
  validatePhone,
  getStatusDisplay,
} from '@/utils/validation';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import styles from './UserApplication.module.scss';

interface ApplicationForm {
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

interface ValidationErrors {
  [key: string]: string;
}

const emptyForm: ApplicationForm = {
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

const UserApplication = () => {
  const { t } = useTranslation();
  const {
    applications,
    currentUser,
    submitApplication,
    isInitializing,
    isLoadingApplications,
    refetchApplications,
  } = useApp();
  const existingApplication = useMemo(
    () =>
      applications.find(
        (application) => application.userId === currentUser?.id
      ),
    [applications, currentUser?.id]
  );

  const isEditable =
    !existingApplication ||
    existingApplication.status === ApplicationStatus.DRAFT ||
    existingApplication.status === ApplicationStatus.AWAITING;

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [isCheckingRecommendation, setIsCheckingRecommendation] =
    useState(true);

  useEffect(() => {
    refetchApplications();
  }, [refetchApplications]);

  useEffect(() => {
    const checkRecommendation = async () => {
      if (isInitializing || !currentUser || existingApplication) {
        setIsCheckingRecommendation(false);
        return;
      }

      try {
        const result = await applicationsApi.checkRecommendation();
        setHasRecommendation(result.hasRecommendation);
      } catch {
        setHasRecommendation(false);
      } finally {
        setIsCheckingRecommendation(false);
      }
    };

    checkRecommendation();
  }, [isInitializing, currentUser, existingApplication]);

  useEffect(() => {
    if (isInitializing || !currentUser) {
      return;
    }

    if (existingApplication) {
      setForm({
        name: existingApplication.name,
        age: existingApplication.age?.toString() ?? '',
        email: existingApplication.email,
        phone: existingApplication.phone,
        gender:
          existingApplication.gender === 'male' ||
          existingApplication.gender === 'female'
            ? existingApplication.gender
            : '',
        stake: existingApplication.stake,
        ward: existingApplication.ward,
        moreInfo: existingApplication.moreInfo ?? '',
        servedMission: existingApplication.servedMission ?? false,
      });
      setIsEditing(existingApplication.status === ApplicationStatus.DRAFT);
    } else if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
        stake: currentUser.stake || '',
        ward: currentUser.ward || '',
      }));
      setIsEditing(true);
    }
  }, [existingApplication, currentUser, isInitializing]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (formError) {
      setFormError('');
    }
    if (feedback) {
      setFeedback('');
    }
  };

  const validateForm = () => {
    const validationErrors: ValidationErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedStake = form.stake.trim();
    const trimmedWard = form.ward.trim();
    const normalizedGender =
      form.gender === 'male' || form.gender === 'female' ? form.gender : '';
    const normalizedAge = Number.parseInt(form.age, 10);

    const nameError = validateRequired(
      form.name,
      t('application.form.name'),
      t
    );
    if (nameError) {
      validationErrors.name = nameError;
    }

    const ageError = validateAge(form.age, t);
    if (ageError) {
      validationErrors.age = ageError;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      validationErrors.email = emailError;
    }

    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      validationErrors.phone = phoneError;
    }

    const stakeError = validateRequired(form.stake, t('common.stake'), t);
    if (stakeError) {
      validationErrors.stake = stakeError;
    }

    const wardError = validateRequired(form.ward, t('common.ward'), t);
    if (wardError) {
      validationErrors.ward = wardError;
    }

    const genderError = validateGender(form.gender);
    if (genderError) {
      validationErrors.gender = genderError;
    }

    return {
      validationErrors,
      normalizedAge,
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      trimmedStake,
      trimmedWard,
      normalizedGender,
    };
  };

  const handleSubmitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    setFeedback('');
    setFormError('');

    const {
      validationErrors,
      normalizedAge,
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      trimmedStake,
      trimmedWard,
      normalizedGender,
    } = validateForm();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors as ValidationErrors);
      setFormError(t('application.messages.fixFields'));
      return;
    }

    submitApplication(currentUser.id, {
      name: trimmedName,
      age: normalizedAge,
      email: trimmedEmail,
      phone: trimmedPhone,
      gender: normalizedGender,
      stake: trimmedStake,
      ward: trimmedWard,
      moreInfo: form.moreInfo.trim(),
      servedMission: form.servedMission,
    })
      .then(async () => {
        setErrors({});
        setFeedback(t('application.messages.submitted'));
        setIsEditing(false);
        await refetchApplications();
      })
      .catch((error) => {
        setFormError(
          (error as Error).message || t('application.messages.failedToSubmit')
        );
      });
  };

  const handleSaveDraft = () => {
    if (!currentUser) {
      return;
    }

    setFeedback('');
    setFormError('');
    setErrors({});

    const normalizedAge = Number.parseInt(form.age, 10);

    submitApplication(currentUser.id, {
      name: form.name.trim(),
      age: Number.isNaN(normalizedAge) ? null : normalizedAge,
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender:
        form.gender === 'male' || form.gender === 'female' ? form.gender : '',
      stake: form.stake.trim(),
      ward: form.ward.trim(),
      moreInfo: form.moreInfo.trim(),
      servedMission: form.servedMission,
    })
      .then(() => {
        setFeedback(t('application.messages.draftSavedWithSubmitReminder'));
      })
      .catch((error) => {
        setFormError(
          (error as Error).message || t('application.messages.failedToSave')
        );
      });
  };

  return (
    <section className={styles.page}>
      {isInitializing ||
      isLoadingApplications ||
      isCheckingRecommendation ? null : (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>{t('application.title')}</h1>
            <p className={styles.subtitle}>
              {hasRecommendation
                ? t('application.subtitle.hasRecommendation')
                : existingApplication
                  ? existingApplication.status === ApplicationStatus.DRAFT
                    ? t('application.subtitle.draftSaved')
                    : isEditable
                      ? t('application.subtitle.canUpdate')
                      : t('application.subtitle.locked')
                  : t('application.subtitle.start')}
            </p>
          </header>

          {hasRecommendation ? (
            <Card>
              <CardContent>
                <Alert variant='info'>
                  {t('application.recommendationAlert.message')}
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <>
              {formError && <Alert variant='error'>{formError}</Alert>}
              {feedback && <Alert variant='success'>{feedback}</Alert>}

              {existingApplication && !isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('application.overview.title')}</CardTitle>
                    {existingApplication.status === ApplicationStatus.DRAFT && (
                      <Alert variant='warning'>
                        {t('application.overview.draftWarning')}
                      </Alert>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className={styles.summaryGrid}>
                      <SummaryItem label={t('application.overview.status')}>
                        {(() => {
                          const status = existingApplication.status;
                          let statusLabel: string;
                          let statusValue: string;
                          let toneValue:
                            | 'draft'
                            | 'awaiting'
                            | 'reviewed'
                            | 'rejected'
                            | 'approved';

                          if (
                            status === ApplicationStatus.APPROVED ||
                            status === ApplicationStatus.REJECTED
                          ) {
                            statusLabel = t('application.status.completed');
                            statusValue =
                              status === ApplicationStatus.APPROVED
                                ? ApplicationStatus.APPROVED
                                : ApplicationStatus.REJECTED;
                            toneValue = 'reviewed';
                          } else if (status === ApplicationStatus.AWAITING) {
                            statusLabel = t('application.status.submitted');
                            statusValue = ApplicationStatus.AWAITING;
                            toneValue = 'awaiting';
                          } else {
                            statusLabel = t('application.status.notSubmitted');
                            statusValue = ApplicationStatus.DRAFT;
                            toneValue = 'draft';
                          }

                          return (
                            <StatusChip
                              status={statusValue}
                              tone={toneValue}
                              label={statusLabel}
                            />
                          );
                        })()}
                      </SummaryItem>
                      <SummaryItem label={t('application.overview.name')}>
                        {existingApplication.name}
                      </SummaryItem>
                      <SummaryItem label={t('application.overview.email')}>
                        {existingApplication.email}
                      </SummaryItem>
                      <SummaryItem label={t('application.overview.phone')}>
                        {existingApplication.phone}
                      </SummaryItem>
                      <SummaryItem label={t('application.overview.age')}>
                        {existingApplication.age ?? t('admin.roles.nA')}
                      </SummaryItem>
                      <SummaryItem label={t('application.overview.stake')}>
                        {getStakeLabel(existingApplication.stake) ||
                          existingApplication.stake}
                      </SummaryItem>
                      <SummaryItem label={t('application.overview.ward')}>
                        {getWardLabel(
                          existingApplication.stake,
                          existingApplication.ward
                        ) || existingApplication.ward}
                      </SummaryItem>
                      {existingApplication.servedMission !== undefined && (
                        <SummaryItem
                          label={t('application.overview.servedMission')}
                        >
                          {existingApplication.servedMission
                            ? t('common.yes')
                            : t('common.no')}
                        </SummaryItem>
                      )}
                      <SummaryItem
                        label={t('application.overview.additionalInfo')}
                      >
                        {existingApplication.moreInfo ||
                          t('application.overview.noAdditionalInfo')}
                      </SummaryItem>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isEditable ? (
                      <Button
                        type='button'
                        variant='primary'
                        onClick={() => setIsEditing(true)}
                      >
                        {t('application.actions.edit')}
                      </Button>
                    ) : (
                      <p className={styles.lockedMessage}>
                        {t('application.messages.lockedMessage')}
                      </p>
                    )}
                  </CardFooter>
                </Card>
              )}

              {isEditing && isEditable && (
                <Card>
                  <CardContent>
                    <form onSubmit={handleSubmitApplication}>
                      <div className={styles.formGrid}>
                        <TextField
                          name='name'
                          label={t('application.form.name')}
                          value={form.name}
                          onChange={handleChange}
                          required
                          error={errors.name}
                        />
                        <TextField
                          name='age'
                          label={t('application.form.age')}
                          type='number'
                          value={form.age}
                          onChange={handleChange}
                          required
                          error={errors.age}
                          min={16}
                          max={120}
                        />
                        <TextField
                          name='email'
                          label={t('application.form.email')}
                          type='email'
                          value={form.email}
                          onChange={handleChange}
                          required
                          error={errors.email}
                        />
                        <TextField
                          name='phone'
                          label={t('application.form.phone')}
                          type='tel'
                          value={form.phone}
                          onChange={handleChange}
                          required
                          error={errors.phone}
                        />
                        <StakeWardSelector
                          stake={form.stake}
                          ward={form.ward}
                          onStakeChange={(stake) =>
                            setForm((prev) => ({ ...prev, stake }))
                          }
                          onWardChange={(ward) =>
                            setForm((prev) => ({ ...prev, ward }))
                          }
                          stakeError={errors.stake}
                          wardError={errors.ward}
                          stakeDisabled={true}
                          wardDisabled={true}
                          stakeLabel={t('common.stake')}
                          wardLabel={t('common.ward')}
                        />
                        <ComboBox
                          name='gender'
                          label={t('application.form.gender')}
                          value={form.gender}
                          onChange={handleChange}
                          required
                          error={errors.gender}
                          variant='default'
                          options={[
                            {
                              value: '',
                              label: t('application.form.genderSelect'),
                              disabled: true,
                            },
                            {
                              value: 'male',
                              label: t('application.form.genderMale'),
                            },
                            {
                              value: 'female',
                              label: t('application.form.genderFemale'),
                            },
                          ]}
                        />
                        <div className={styles.toggleWrapper}>
                          <label className={styles.toggleLabel}>
                            {t('application.form.servedMission')}
                            <span className={styles.requiredIndicator}>*</span>
                          </label>
                          <ToggleButton
                            checked={form.servedMission}
                            onChange={(value) =>
                              setForm((prev) => ({
                                ...prev,
                                servedMission: value,
                              }))
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
                        label={t('application.form.additionalInfo')}
                        value={form.moreInfo}
                        onChange={handleChange}
                        placeholder={t(
                          'application.form.additionalInfoPlaceholder'
                        )}
                        multiline
                        rows={4}
                        wrapperClassName={styles.formFull}
                        showRequiredIndicator={false}
                      />
                      <div className={styles.actions}>
                        <Button type='submit' variant='primary'>
                          {t('application.actions.submit')}
                        </Button>
                        <Button type='button' onClick={handleSaveDraft}>
                          {t('application.actions.saveDraft')}
                        </Button>
                        {existingApplication && (
                          <Button
                            type='button'
                            variant='danger'
                            onClick={() => setIsEditing(false)}
                          >
                            {t('application.actions.cancel')}
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {!existingApplication && !isEditing && (
                <div className={styles.startButton}>
                  <Button
                    type='button'
                    variant='primary'
                    onClick={() => setIsEditing(true)}
                  >
                    {t('application.actions.start')}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
};

export default UserApplication;
