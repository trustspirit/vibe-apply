import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <h1 className={styles.title}>{t('auth.signIn.title')}</h1>
      <p className={styles.subtitle}>
        {t('auth.signIn.subtitle')}
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          {t('common.email')}
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
          {t('common.password')}
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
          {isSubmitting ? t('auth.signIn.buttonLoading') : t('auth.signIn.button')}
        </Button>
      </form>

      <div className={styles.divider}>
        <span>{t('common.or')}</span>
      </div>

      <GoogleButton onClick={handleGoogleSignIn} />

      <p className={styles.footer}>
        {t('auth.signIn.newHere')} <Link to={ROUTES.SIGN_UP}>{t('auth.signIn.createAccount')}</Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;
