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
      const redirectTo = location.state?.from?.pathname ?? getDefaultPathForUser(user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth auth--centered">
      <div className="auth__panel">
        <h1 className="auth__title">Sign In</h1>
        <p className="auth__subtitle">Enter your credentials to access the portal.</p>
        <form className="auth__form" onSubmit={handleSubmit}>
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
            />
          </label>
          {error && <p className="auth__error">{error}</p>}
          <Button type="submit" variant="primary" className="auth__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <p className="auth__footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
        <p className="auth__hint">Default admin: admin@vibeapply.com / admin123</p>
      </div>
    </div>
  );
};

export default SignIn;
