import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

const SignIn = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/application', { replace: true });
    }
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const loggedIn = await login(form);
      const redirectPath = location.state?.from?.pathname;
      navigate(
        redirectPath || (loggedIn.role === 'admin' ? '/admin/dashboard' : '/application'),
        { replace: true },
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={4}
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: '100%', maxWidth: 420, p: 4, mt: { xs: 4, md: 6 } }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in with your credentials to continue.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large">
            Sign In
          </Button>

          <Typography variant="body2" textAlign="center">
            No account?{' '}
            <Link component={RouterLink} to="/signup">
              Create one now
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SignIn;
