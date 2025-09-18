import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { Button } from '../../components/ui';
import './SignUp.scss';

const SignUp = () => {
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signUp({ name: form.name, email: form.email, password: form.password });
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/application', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth auth--centered">
      <div className="auth__panel">
        <h1 className="auth__title">Create Account</h1>
        <p className="auth__subtitle">Sign up to start managing applications.</p>
        <form className="auth__form" onSubmit={handleSubmit}>
          <label className="auth__label">
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="auth__input"
              required
            />
          </label>
          <label className="auth__label">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="auth__input"
              required
            />
          </label>
          <label className="auth__label">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="auth__input"
              required
              minLength={6}
            />
          </label>
          <label className="auth__label">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="auth__input"
              required
              minLength={6}
            />
          </label>
          {error && <p className="auth__error">{error}</p>}
          <Button type="submit" variant="primary" className="auth__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        <p className="auth__footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
