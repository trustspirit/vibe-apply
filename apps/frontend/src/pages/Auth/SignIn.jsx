import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { Button } from '../../components/ui';
import { getDefaultPathForUser } from '../../utils/navigation.js';
import './SignIn.scss';

const SignIn = () => {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await signIn({ ...form });
      const redirectTo =
        location.state?.from?.pathname ?? getDefaultPathForUser(user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const redirectUrl = `${backendUrl}/api/auth/google`;
    window.location.href = redirectUrl;
  };

  return (
    <div className='auth auth--centered'>
      <div className='auth__panel'>
        <h1 className='auth__title'>Sign In</h1>
        <p className='auth__subtitle'>
          Enter your credentials to access the portal.
        </p>
        <form className='auth__form' onSubmit={handleSubmit}>
          <label className='auth__label'>
            Email
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              className='auth__input'
              required
            />
          </label>
          <label className='auth__label'>
            Password
            <input
              type='password'
              name='password'
              value={form.password}
              onChange={handleChange}
              className='auth__input'
              required
            />
          </label>
          {error && <p className='auth__error'>{error}</p>}
          <Button
            type='submit'
            variant='primary'
            className='auth__submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className='auth__divider'>
          <span>or</span>
        </div>

        <Button
          type='button'
          variant='outline'
          className='auth__google-btn'
          onClick={handleGoogleSignIn}
        >
          <svg
            className='auth__google-icon'
            viewBox='0 0 24 24'
            width='20'
            height='20'
          >
            <path
              fill='#4285F4'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='#34A853'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='#FBBC05'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill='#EA4335'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
          Continue with Google
        </Button>

        <p className='auth__footer'>
          New here? <Link to='/signup'>Create an account</Link>
        </p>
        <p className='auth__hint'>
          Default admin: admin@vibeapply.com / admin123
        </p>
      </div>
    </div>
  );
};

export default SignIn;
