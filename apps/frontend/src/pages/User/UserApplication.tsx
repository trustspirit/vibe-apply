import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import {
  Alert,
  Button,
  Card,
  CardContent,
  ComboBox,
  StakeWardSelector,
  TextField,
  ToggleButton,
} from '@/components/ui';
import { ApplicationStatus, Gender } from '@vibe-apply/shared';
import { useApplicationForm } from './hooks/useApplicationForm';
import { ApplicationOverview } from './components/ApplicationOverview';
import styles from './UserApplication.module.scss';

const UserApplication = () => {
  const { t } = useTranslation();
  const {
    applications,
    currentUser,
    isInitializing,
    isLoadingApplications,
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

  const {
    form,
    setForm,
    isEditing,
    setIsEditing,
    feedback,
    formError,
    errors,
    hasRecommendation,
    isCheckingRecommendation,
    handleChange,
    handleSubmitApplication,
    handleSaveDraft,
  } = useApplicationForm({
    currentUser,
    existingApplication,
    isInitializing,
    t,
  });

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
                <ApplicationOverview
                  application={existingApplication}
                  isEditable={isEditable}
                  onEdit={() => setIsEditing(true)}
                />
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
                              value: Gender.MALE,
                              label: t('application.form.genderMale'),
                            },
                            {
                              value: Gender.FEMALE,
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
