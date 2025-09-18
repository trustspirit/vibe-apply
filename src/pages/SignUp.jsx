import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

const SignUp = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const newUser = await register(form);
      navigate(newUser.role === 'admin' ? '/admin/dashboard' : '/application', {
        replace: true,
      });
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
        sx={{ width: '100%', maxWidth: 480, p: 4, mt: { xs: 4, md: 6 } }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join Vibe Apply and manage your application effortlessly.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />
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
            Sign Up
          </Button>

          <Typography variant="body2" textAlign="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/signin">
              Sign in instead
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SignUp;
