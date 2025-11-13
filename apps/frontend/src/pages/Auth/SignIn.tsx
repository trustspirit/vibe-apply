import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Alert, Button, GoogleButton } from '@/components/ui';
import { AuthLayout } from '@/components';
import { getDefaultPathForUser } from '@/utils/navigation';
import { ROUTES } from '@/utils/constants';
import { useForm } from '@/hooks';
import styles from '@/components/AuthLayout.module.scss';

interface SignInForm {
  email: string;
  password: string;
}

const SignIn = () => {
  const { signIn, isInitializing } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const { values, handleChange, isSubmitting, setIsSubmitting } = useForm<SignInForm>({
    initialValues: { email: '', password: '' },
  });

  if (isInitializing) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await signIn({ ...values });
      const redirectTo =
        location.state?.from?.pathname ?? getDefaultPathForUser(user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const redirectUrl = `${backendUrl}/api/auth/google`;
    window.location.href = redirectUrl;
  };

  return (
    <AuthLayout>
      <h1 className={styles.title}>Sign In</h1>
      <p className={styles.subtitle}>
        Enter your credentials to access the portal.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Email
          <input
            type='email'
            name='email'
            value={values.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            type='password'
            name='password'
            value={values.password}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
        {error && <Alert variant='error'>{error}</Alert>}
        <Button
          type='submit'
          variant='primary'
          className={styles.submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <GoogleButton onClick={handleGoogleSignIn} />

      <p className={styles.footer}>
        New here? <Link to={ROUTES.SIGN_UP}>Create an account</Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;
