import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { UserRole, LeaderStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { Button, TextField } from '@/components/ui';
import { authApi } from '@/services/api';
import { USER_ROLES, LEADER_STATUS } from '@/utils/constants';
import styles from './AccountSettings.module.scss';

interface AccountForm {
  stake: string;
  ward: string;
  phone: string;
}

const AccountSettings = () => {
  const { currentUser, setUser } = useApp();
  
  const [form, setForm] = useState<AccountForm>({
    stake: currentUser?.stake || '',
    ward: currentUser?.ward || '',
    phone: currentUser?.phone || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const updates: Partial<AccountForm> = {};
      if (form.stake !== currentUser?.stake) updates.stake = form.stake;
      if (form.ward !== currentUser?.ward) updates.ward = form.ward;
      if (form.phone !== currentUser?.phone) updates.phone = form.phone;

      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        setIsSubmitting(false);
        return;
      }

      const updatedUser = await authApi.updateProfile(updates);
      setUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = () => {
    if (currentUser?.role === (USER_ROLES.ADMIN as UserRole)) return 'Administrator';
    if (currentUser?.role === (USER_ROLES.SESSION_LEADER as UserRole)) return 'Session Leader';
    if (currentUser?.role === (USER_ROLES.STAKE_PRESIDENT as UserRole)) {
      return currentUser?.leaderStatus === (LEADER_STATUS.APPROVED as LeaderStatus)
        ? 'Stake President (Approved)' 
        : 'Stake President (Pending Approval)';
    }
    if (currentUser?.role === (USER_ROLES.BISHOP as UserRole)) {
      return currentUser?.leaderStatus === (LEADER_STATUS.APPROVED as LeaderStatus)
        ? 'Bishop (Approved)' 
        : 'Bishop (Pending Approval)';
    }
    return 'Applicant';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className={styles.accountSettings}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile information and preferences
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <p className={styles.sectionDescription}>
              Your basic account information. Contact an administrator to change your name or email.
            </p>
            
            <div className={styles.fields}>
              <TextField
                label='Full Name'
                name='name'
                value={currentUser.name}
                disabled
                helperText='Contact admin to update'
              />

              <TextField
                label='Email Address'
                name='email'
                type='email'
                value={currentUser.email}
                disabled
                helperText='Contact admin to update'
              />

              <TextField
                label='Phone Number'
                name='phone'
                type='tel'
                value={form.phone}
                onChange={handleChange}
                placeholder='e.g., (555) 123-4567'
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Church Information</h2>
            <p className={styles.sectionDescription}>
              Your current stake and ward assignment. Changes will be reflected in all applications and recommendations.
            </p>
            
            <div className={styles.fields}>
              <TextField
                label='Stake'
                name='stake'
                value={form.stake}
                onChange={handleChange}
                required
                placeholder='Enter your stake'
              />

              <TextField
                label='Ward'
                name='ward'
                value={form.ward}
                onChange={handleChange}
                required
                placeholder='Enter your ward'
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Account Role</h2>
            <p className={styles.sectionDescription}>
              Your current role and permissions in the system.
            </p>
            
            <div className={styles.roleDisplay}>
              <div className={styles.roleItem}>
                <span className={styles.roleLabel}>Current Role</span>
                <span className={styles.roleValue}>{getRoleLabel()}</span>
              </div>
              {((currentUser.role === (USER_ROLES.BISHOP as UserRole) || currentUser.role === (USER_ROLES.STAKE_PRESIDENT as UserRole)) && currentUser.leaderStatus === (LEADER_STATUS.PENDING as LeaderStatus)) && (
                <p className={styles.roleNote}>
                  Your leader access is pending approval by an administrator.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className={`${styles.message} ${styles.messageError}`}>
              {error}
            </div>
          )}
          {success && (
            <div className={`${styles.message} ${styles.messageSuccess}`}>
              {success}
            </div>
          )}

          <div className={styles.actions}>
            <Button
              type='submit'
              variant='primary'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
