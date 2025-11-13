import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Alert, Button } from '@/components/ui';
import AuthLayout from '@/components/AuthLayout';
import { ROUTES } from '@/utils/constants';
import styles from '@/components/AuthLayout.module.scss';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<SignUpForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
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
      <h1 className={styles.title}>Create Account</h1>
      <p className={styles.subtitle}>
        Sign up to start managing applications.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Name
          <input
            type='text'
            name='name'
            value={form.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Email
          <input
            type='email'
            name='email'
            value={form.email}
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
            value={form.password}
            onChange={handleChange}
            className={styles.input}
            required
            minLength={6}
          />
        </label>
        <label className={styles.label}>
          Confirm Password
          <input
            type='password'
            name='confirmPassword'
            value={form.confirmPassword}
            onChange={handleChange}
            className={styles.input}
            required
            minLength={6}
          />
        </label>
        {error && <Alert variant='error'>{error}</Alert>}
        <Button
          type='submit'
          variant='primary'
          className={styles.submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      <p className={styles.footer}>
        Already have an account? <Link to={ROUTES.SIGN_IN}>Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
