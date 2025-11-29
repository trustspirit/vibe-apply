import { type ChangeEvent, type FormEvent, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { Button, ComboBox, StakeWardSelector } from '@/components/ui';
import { getDefaultPathForUser } from '@/utils/navigation';
import { authApi } from '@/services/api';
import { USER_ROLES, ROUTES } from '@/utils/constants';
import styles from '@/components/AuthLayout.module.scss';

interface ProfileForm {
  stake: string;
  ward: string;
  role: UserRole;
}

const CompleteProfile = () => {
  const { t } = useTranslation();
  const { currentUser, setUser } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileForm>({
    stake: 'seoul-stake',
    ward: '',
    role: USER_ROLES.APPLICANT as UserRole,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = useMemo(
    () => [
      { value: USER_ROLES.APPLICANT, label: t('roles.applicant') },
      { value: USER_ROLES.SESSION_LEADER, label: t('roles.sessionLeader') },
      { value: USER_ROLES.BISHOP, label: t('roles.bishop') },
      { value: USER_ROLES.STAKE_PRESIDENT, label: t('roles.stakePresident') },
    ],
    [t]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStakeChange = (stake: string) => {
    setForm((prev) => ({ ...prev, stake }));
  };

  const handleWardChange = (ward: string) => {
    setForm((prev) => ({ ...prev, ward }));
  };

  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, role: event.target.value as UserRole }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const updatedUser = await authApi.completeProfile({ 
        role: form.role,
        ward: form.ward,
        stake: form.stake,
      });
      
      setUser(updatedUser);

      navigate(getDefaultPathForUser(updatedUser), { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    navigate(ROUTES.SIGN_IN);
    return null;
  }

  if (currentUser.role && currentUser.stake && currentUser.ward) {
    navigate(getDefaultPathForUser(currentUser), { replace: true });
    return null;
  }

  return (
    <div className={`${styles.auth} ${styles.authCentered}`}>
      <div className={styles.panel}>
        <h1 className={styles.title}>{t('auth.completeProfile.title')}</h1>
        <p className={styles.subtitle}>
          {t('auth.completeProfile.welcome', { name: currentUser.name })}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.label}>
            <StakeWardSelector
              stake={form.stake}
              ward={form.ward}
              onStakeChange={handleStakeChange}
              onWardChange={handleWardChange}
            />
          </div>

          <div className={styles.label}>
            <span>{t('auth.completeProfile.accountType')}</span>
            <ComboBox
              options={roleOptions}
              value={form.role}
              onChange={handleRoleChange}
            />
            <p className={styles.choiceHint}>
              {t('auth.completeProfile.approvalHint')}
            </p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button
            type='submit'
            variant='primary'
            className={styles.submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.completeProfile.buttonLoading') : t('auth.completeProfile.button')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
