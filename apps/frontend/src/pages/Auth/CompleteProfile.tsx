import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui';
import { getDefaultPathForUser } from '../../utils/navigation';
import { authApi } from '../../services/api';
import { USER_ROLES, ROUTES } from '../../utils/constants';
import type { UserRole } from '@vibe-apply/shared';
import './SignUp.scss';

interface ProfileForm {
  stake: string;
  ward: string;
  role: UserRole;
}

const CompleteProfile = () => {
  const { currentUser, setUser } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileForm>({
    stake: '',
    ward: '',
    role: USER_ROLES.APPLICANT as UserRole,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    <div className='auth auth--centered'>
      <div className='auth__panel'>
        <h1 className='auth__title'>Complete Your Profile</h1>
        <p className='auth__subtitle'>
          Welcome {currentUser.name}! Please select your role to continue.
        </p>

        <form className='auth__form' onSubmit={handleSubmit}>
          <label className='auth__label'>
            Stake
            <input
              type='text'
              name='stake'
              value={form.stake}
              onChange={handleChange}
              className='auth__input'
              required
            />
          </label>
          <label className='auth__label'>
            Ward
            <input
              type='text'
              name='ward'
              value={form.ward}
              onChange={handleChange}
              className='auth__input'
              required
            />
          </label>

          <div className='auth__label auth__label--inline'>
            <span>Account Type</span>
            <div className='auth__options'>
              <label className='auth__option'>
                <input
                  type='radio'
                  name='role'
                  value={USER_ROLES.APPLICANT}
                  checked={form.role === USER_ROLES.APPLICANT}
                  onChange={handleChange}
                />
                Applicant
              </label>
              <label className='auth__option'>
                <input
                  type='radio'
                  name='role'
                  value={USER_ROLES.LEADER}
                  checked={form.role === USER_ROLES.LEADER}
                  onChange={handleChange}
                />
                Leader
              </label>
            </div>
            <p className='auth__choice-hint'>
              Leader access requires admin approval before activation.
            </p>
          </div>

          {error && <p className='auth__error'>{error}</p>}

          <Button
            type='submit'
            variant='primary'
            className='auth__submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Completing Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
