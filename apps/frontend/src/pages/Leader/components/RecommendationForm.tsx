import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { RecommendationStatus } from '@vibe-apply/shared';
import {
  Button,
  ComboBox,
  StakeWardSelector,
  TextField,
  ToggleButton,
} from '@/components/ui';
import { USER_ROLES } from '@/utils/constants';
import type { RecommendationFormProps } from '../types';
import styles from '../LeaderRecommendations.module.scss';

export const RecommendationForm = ({
  form,
  errors,
  formError,
  editingOriginStatus,
  variant = 'desktop',
  currentUserRole,
  onFormChange,
  onStakeChange,
  onWardChange,
  onServedMissionChange,
  onSubmit,
  onSaveDraft,
  onCancel,
}: RecommendationFormProps) => {
  const { t } = useTranslation();

  return (
    <form
      className={clsx(
        'leader-recommendations__form',
        variant === 'mobile' && 'leader-recommendations__form--mobile'
      )}
      onSubmit={onSubmit}
    >
      {editingOriginStatus === RecommendationStatus.SUBMITTED && (
        <p className={styles.alert}>
          {t('leader.recommendations.form.editingAlert')}
        </p>
      )}
      {formError && (
        <p className={`${styles.alert} ${styles.alertError}`}>{formError}</p>
      )}
      <div className={styles.grid}>
        <TextField
          name='name'
          label={t('leader.recommendations.form.applicantName')}
          value={form.name}
          onChange={onFormChange}
          required
          error={errors.name}
        />
        <TextField
          name='age'
          label={t('leader.recommendations.form.age')}
          type='number'
          value={form.age}
          onChange={onFormChange}
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
          onChange={onFormChange}
          error={errors.email}
        />
        <TextField
          name='phone'
          label={t('leader.recommendations.form.phone')}
          type='tel'
          value={form.phone}
          onChange={onFormChange}
          required
          error={errors.phone}
        />
        <StakeWardSelector
          stake={form.stake}
          ward={form.ward}
          onStakeChange={onStakeChange}
          onWardChange={onWardChange}
          stakeError={errors.stake}
          wardError={errors.ward}
          stakeDisabled={true}
          wardDisabled={
            currentUserRole === USER_ROLES.BISHOP ||
            currentUserRole === USER_ROLES.APPLICANT
          }
          stakeLabel={t('leader.recommendations.form.stake')}
          wardLabel={t('leader.recommendations.form.ward')}
        />
        <ComboBox
          name='gender'
          label={t('leader.recommendations.form.gender')}
          value={form.gender}
          onChange={onFormChange}
          required
          error={errors.gender}
          options={[
            {
              value: '',
              label: t('leader.recommendations.form.genderSelect'),
              disabled: true,
            },
            {
              value: 'male',
              label: t('leader.recommendations.form.genderMale'),
            },
            {
              value: 'female',
              label: t('leader.recommendations.form.genderFemale'),
            },
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
            onChange={onServedMissionChange}
            labelOn={t('common.yes')}
            labelOff={t('common.no')}
          />
          {errors.servedMission && (
            <span className={styles.errorText}>{errors.servedMission}</span>
          )}
        </div>
      </div>
      <TextField
        name='moreInfo'
        label={t('leader.recommendations.form.additionalInfo')}
        value={form.moreInfo}
        onChange={onFormChange}
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
        <Button type='submit' variant='primary' className={styles.btn}>
          {t('leader.recommendations.form.submitRecommendation')}
        </Button>
        <Button
          type='button'
          onClick={onSaveDraft}
          className={styles.btn}
        >
          {t('leader.recommendations.form.saveDraft')}
        </Button>
        <Button
          type='button'
          variant='danger'
          onClick={onCancel}
          className={styles.btn}
        >
          {t('leader.recommendations.form.cancel')}
        </Button>
      </div>
    </form>
  );
};

