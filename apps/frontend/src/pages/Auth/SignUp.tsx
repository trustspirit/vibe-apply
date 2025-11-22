import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { Alert, Button } from '@/components/ui';
import { AuthLayout } from '@/components';
import { ROUTES } from '@/utils/constants';
import { PASSWORD_MIN_LENGTH } from '@/utils/validationConstants';
import { useForm } from '@/hooks';
import styles from '@/components/AuthLayout.module.scss';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const { t } = useTranslation();
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { values, handleChange, isSubmitting, setIsSubmitting } = useForm<SignUpForm>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (values.password !== values.confirmPassword) {
      setError(t('auth.signUp.passwordsDoNotMatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className={styles.title}>{t('auth.signUp.title')}</h1>
      <p className={styles.subtitle}>
        {t('auth.signUp.subtitle')}
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          {t('common.name')}
          <input
            type='text'
            name='name'
            value={values.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
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
            minLength={PASSWORD_MIN_LENGTH}
          />
        </label>
        <label className={styles.label}>
          {t('common.confirmPassword')}
          <input
            type='password'
            name='confirmPassword'
            value={values.confirmPassword}
            onChange={handleChange}
            className={styles.input}
            required
            minLength={PASSWORD_MIN_LENGTH}
          />
        </label>
        {error && <Alert variant='error'>{error}</Alert>}
        <Button
          type='submit'
          variant='primary'
          className={styles.submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('auth.signUp.buttonLoading') : t('auth.signUp.button')}
        </Button>
      </form>
      <p className={styles.footer}>
        {t('auth.signUp.alreadyHaveAccount')} <Link to={ROUTES.SIGN_IN}>{t('auth.signUp.signIn')}</Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
