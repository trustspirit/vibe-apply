import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { applicationsApi } from '@/services/api';
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, CardTitle, ComboBox, StakeWardSelector, StatusChip, TextField } from '@/components/ui';
import { validateEmail, validateAge, validateRequired, validateGender, validatePhone, getStatusDisplay } from '@/utils/validation';
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
};

const UserApplication = () => {
  const { t } = useTranslation();
  const { applications, currentUser, submitApplication, isInitializing, isLoadingApplications, refetchApplications } = useApp();
  const existingApplication = useMemo(
    () =>
      applications.find(
        (application) => application.userId === currentUser?.id
      ),
    [applications, currentUser?.id]
  );

  const isEditable = !existingApplication || existingApplication.status === 'draft' || existingApplication.status === 'awaiting';

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [isCheckingRecommendation, setIsCheckingRecommendation] = useState(true);

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
      });
      setIsEditing(existingApplication.status === 'draft');
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

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const nameError = validateRequired(form.name, t('application.form.name'), t);
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
    })
      .then(() => {
        setErrors({});
        setFeedback(t('application.messages.submitted'));
        setIsEditing(false);
      })
      .catch((error) => {
        setFormError((error as Error).message || t('application.messages.failedToSubmit'));
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
    })
      .then(() => {
        setFeedback(t('application.messages.draftSaved'));
      })
      .catch((error) => {
        setFormError((error as Error).message || t('application.messages.failedToSave'));
      });
  };

  return (
    <section className={styles.page}>
      {(isInitializing || isLoadingApplications || isCheckingRecommendation) ? null : (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>{t('application.title')}</h1>
            <p className={styles.subtitle}>
              {hasRecommendation
                ? t('application.subtitle.hasRecommendation')
                : existingApplication
                  ? existingApplication.status === 'draft'
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
            {existingApplication.status === 'draft' && (
              <Alert variant='warning'>
                {t('application.overview.draftWarning')}
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <div className={styles.summaryGrid}>
              {existingApplication.status && (
                <div className={styles.summaryItem}>
                  <dt className={styles.summaryLabel}>{t('application.overview.status')}</dt>
                  <dd className={styles.summaryValue}>
                    {(() => {
                      const display = getStatusDisplay(existingApplication.status);
                      const statusLabel = t(`status.${existingApplication.status}`);
                      return (
                        <StatusChip
                          status={existingApplication.status}
                          tone={display.tone}
                          label={statusLabel}
                        />
                      );
                    })()}
                  </dd>
                </div>
              )}
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>{t('application.overview.name')}</dt>
                <dd className={styles.summaryValue}>{existingApplication.name}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>{t('application.overview.email')}</dt>
                <dd className={styles.summaryValue}>{existingApplication.email}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>{t('application.overview.phone')}</dt>
                <dd className={styles.summaryValue}>{existingApplication.phone}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>{t('application.overview.age')}</dt>
                <dd className={styles.summaryValue}>{existingApplication.age ?? t('admin.roles.nA')}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>{t('application.overview.stake')}</dt>
                <dd className={styles.summaryValue}>{existingApplication.stake}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>{t('application.overview.ward')}</dt>
                <dd className={styles.summaryValue}>{existingApplication.ward}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>{t('application.overview.additionalInfo')}</dt>
                <dd className={styles.summaryValue}>
                  {existingApplication.moreInfo ||
                    t('application.overview.noAdditionalInfo')}
                </dd>
              </div>
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
                  onStakeChange={(stake) => setForm((prev) => ({ ...prev, stake }))}
                  onWardChange={(ward) => setForm((prev) => ({ ...prev, ward }))}
                  stakeError={errors.stake}
                  wardError={errors.ward}
                  stakeDisabled
                  wardDisabled
                />
                <ComboBox
                  name='gender'
                  label={t('application.form.gender')}
                  value={form.gender}
                  onChange={handleChange}
                  showRequiredIndicator={false}
                  error={errors.gender}
                  variant='default'
                  options={[
                    { value: '', label: t('application.form.genderSelect'), disabled: true },
                    { value: 'male', label: t('application.form.genderMale') },
                    { value: 'female', label: t('application.form.genderFemale') },
                  ]}
                />
              </div>
              <TextField
                name='moreInfo'
                label={t('application.form.additionalInfo')}
                value={form.moreInfo}
                onChange={handleChange}
                placeholder={t('application.form.additionalInfoPlaceholder')}
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
