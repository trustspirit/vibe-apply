import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
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

    const nameError = validateRequired(form.name, 'Name');
    if (nameError) {
      validationErrors.name = nameError;
    }

    const ageError = validateAge(form.age);
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

    const stakeError = validateRequired(form.stake, 'Stake');
    if (stakeError) {
      validationErrors.stake = stakeError;
    }

    const wardError = validateRequired(form.ward, 'Ward');
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
      setFormError('Please fix the highlighted fields before submitting.');
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
        setFeedback('Your application has been submitted and is awaiting review.');
        setIsEditing(false);
      })
      .catch((error) => {
        setFormError((error as Error).message || 'Failed to submit application.');
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
        setFeedback(
          'Draft saved. You can return anytime to complete and submit your application.'
        );
      })
      .catch((error) => {
        setFormError((error as Error).message || 'Failed to save draft.');
      });
  };

  return (
    <section className={styles.page}>
      {(isInitializing || isLoadingApplications || isCheckingRecommendation) ? null : (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>Application</h1>
            <p className={styles.subtitle}>
              {hasRecommendation
                ? 'You have already been recommended by your leader.'
                : existingApplication
                  ? existingApplication.status === 'draft'
                    ? 'Your draft is saved. Complete the required fields and submit when you are ready.'
                    : isEditable
                      ? 'You can update your submission while it is being reviewed.'
                      : 'Your submission is locked while a decision is finalized.'
                  : 'Start your application to be considered.'}
            </p>
          </header>

      {hasRecommendation ? (
        <Card>
          <CardContent>
            <Alert variant='info'>
              You have already been recommended by your leader. Please contact your bishop or stake president if you have questions.
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
            <CardTitle>Submission Overview</CardTitle>
            {existingApplication.status === 'draft' && (
              <Alert variant='warning'>
                This application is saved as a draft. Submit it when the required
                fields are complete.
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <div className={styles.summaryGrid}>
              {existingApplication.status && (
                <div className={styles.summaryItem}>
                  <dt className={styles.summaryLabel}>Status</dt>
                  <dd className={styles.summaryValue}>
                    {(() => {
                      const display = getStatusDisplay(existingApplication.status);
                      return (
                        <StatusChip
                          status={existingApplication.status}
                          tone={display.tone}
                          label={display.label}
                        />
                      );
                    })()}
                  </dd>
                </div>
              )}
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>Name</dt>
                <dd className={styles.summaryValue}>{existingApplication.name}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>Email</dt>
                <dd className={styles.summaryValue}>{existingApplication.email}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>Phone</dt>
                <dd className={styles.summaryValue}>{existingApplication.phone}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>Age</dt>
                <dd className={styles.summaryValue}>{existingApplication.age ?? 'N/A'}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>Stake</dt>
                <dd className={styles.summaryValue}>{existingApplication.stake}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>Ward</dt>
                <dd className={styles.summaryValue}>{existingApplication.ward}</dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>Additional Information</dt>
                <dd className={styles.summaryValue}>
                  {existingApplication.moreInfo ||
                    'No additional details provided.'}
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
                Edit Submission
              </Button>
            ) : (
              <p className={styles.lockedMessage}>
                Edits are unavailable because your submission is being finalized.
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
                  label='Name'
                  value={form.name}
                  onChange={handleChange}
                  required
                  error={errors.name}
                />
                <TextField
                  name='age'
                  label='Age'
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
                  label='Email'
                  type='email'
                  value={form.email}
                  onChange={handleChange}
                  required
                  error={errors.email}
                />
                <TextField
                  name='phone'
                  label='Phone'
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
                  label='Gender (optional)'
                  value={form.gender}
                  onChange={handleChange}
                  showRequiredIndicator={false}
                  error={errors.gender}
                  variant='default'
                  options={[
                    { value: '', label: 'Select gender', disabled: true },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                />
              </div>
              <TextField
                name='moreInfo'
                label='Additional Information'
                value={form.moreInfo}
                onChange={handleChange}
                placeholder='Share any relevant experience or context.'
                multiline
                rows={4}
                wrapperClassName={styles.formFull}
                showRequiredIndicator={false}
              />
              <div className={styles.actions}>
                <Button type='submit' variant='primary'>
                  Submit Application
                </Button>
                <Button type='button' onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                {existingApplication && (
                  <Button
                    type='button'
                    variant='danger'
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
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
            Start Application
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
