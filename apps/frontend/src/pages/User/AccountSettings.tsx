import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, TextField } from '../../components/ui';
import { authApi } from '../../services/api';
import { USER_ROLES, LEADER_STATUS } from '../../utils/constants';
import type { UserRole, LeaderStatus } from '@vibe-apply/shared';
import './AccountSettings.scss';

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
    <div className='account-settings'>
      <div className='account-settings__container'>
        <div className='account-settings__header'>
          <h1 className='account-settings__title'>Account Settings</h1>
          <p className='account-settings__subtitle'>
            Manage your profile information and preferences
          </p>
        </div>

        <form className='account-settings__form' onSubmit={handleSubmit}>
          <div className='account-settings__section'>
            <h2 className='account-settings__section-title'>Personal Information</h2>
            <p className='account-settings__section-description'>
              Your basic account information. Contact an administrator to change your name or email.
            </p>
            
            <div className='account-settings__fields'>
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

          <div className='account-settings__section'>
            <h2 className='account-settings__section-title'>Church Information</h2>
            <p className='account-settings__section-description'>
              Your current stake and ward assignment. Changes will be reflected in all applications and recommendations.
            </p>
            
            <div className='account-settings__fields'>
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

          <div className='account-settings__section'>
            <h2 className='account-settings__section-title'>Account Role</h2>
            <p className='account-settings__section-description'>
              Your current role and permissions in the system.
            </p>
            
            <div className='account-settings__role-display'>
              <div className='account-settings__role-item'>
                <span className='account-settings__role-label'>Current Role</span>
                <span className='account-settings__role-value'>{getRoleLabel()}</span>
              </div>
              {((currentUser.role === (USER_ROLES.BISHOP as UserRole) || currentUser.role === (USER_ROLES.STAKE_PRESIDENT as UserRole)) && currentUser.leaderStatus === (LEADER_STATUS.PENDING as LeaderStatus)) && (
                <p className='account-settings__role-note'>
                  Your leader access is pending approval by an administrator.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className='account-settings__message account-settings__message--error'>
              {error}
            </div>
          )}
          {success && (
            <div className='account-settings__message account-settings__message--success'>
              {success}
            </div>
          )}

          <div className='account-settings__actions'>
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
