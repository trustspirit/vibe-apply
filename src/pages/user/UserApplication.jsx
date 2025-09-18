import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApplications } from '../../context/ApplicationContext.jsx';

const createDefaultForm = (user) => ({
  name: user?.name || '',
  age: '',
  email: user?.email || '',
  phone: '',
  gender: '',
  stake: '',
  ward: '',
  additionalInfo: '',
});

const UserApplication = () => {
  const { user } = useAuth();
  const { getUserApplication, submitApplication } = useApplications();
  const existing = getUserApplication(user.id);
  const [showForm, setShowForm] = useState(!!existing);
  const [form, setForm] = useState(existing ? { ...existing } : createDefaultForm(user));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({ ...existing });
      setShowForm(true);
    }
  }, [existing]);

  const isEditable = useMemo(() => {
    if (!existing) return true;
    return existing.status === 'awaiting';
  }, [existing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    try {
      submitApplication(user.id, {
        name: form.name.trim(),
        age: form.age,
        email: form.email.trim(),
        phone: form.phone,
        gender: form.gender,
        stake: form.stake,
        ward: form.ward,
        additionalInfo: form.additionalInfo,
      });
      setMessage(existing ? 'Changes saved.' : 'Application submitted.');
    } catch (err) {
      setError(err.message);
    }
  };

  const renderSummary = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Your Submission</Typography>
      <Stack spacing={1} mt={2}>
        <Typography>Name: {existing?.name}</Typography>
        <Typography>Age: {existing?.age}</Typography>
        <Typography>Email: {existing?.email}</Typography>
        <Typography>Phone: {existing?.phone}</Typography>
        <Typography>Gender: {existing?.gender}</Typography>
        <Typography>Stake: {existing?.stake}</Typography>
        <Typography>Ward: {existing?.ward}</Typography>
        <Typography>Additional Information: {existing?.additionalInfo || 'N/A'}</Typography>
      </Stack>
    </Paper>
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        My Application
      </Typography>

      {!existing && !showForm && (
        <Paper sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h6">Ready to apply?</Typography>
            <Typography color="text.secondary">
              Begin your application to share your details with the administrative team.
            </Typography>
            <Button variant="contained" onClick={() => setShowForm(true)}>
              Start Application
            </Button>
          </Stack>
        </Paper>
      )}

      {showForm && (
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6">
                {existing ? 'Update your application' : 'Application details'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {existing
                  ? isEditable
                    ? 'You may update your details while the review is in progress.'
                    : 'Your application is locked and cannot be edited.'
                  : 'Provide accurate details to help the admin review your application.'}
              </Typography>
            </Box>

            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  required
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  fullWidth
                  disabled={!isEditable}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Stake"
                  name="stake"
                  value={form.stake}
                  onChange={handleChange}
                  required
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Ward"
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  required
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  label="Additional Information"
                  name="additionalInfo"
                  value={form.additionalInfo}
                  onChange={handleChange}
                  multiline
                  minRows={4}
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
            </Grid>

            <Box>
              <Button type="submit" variant="contained" disabled={!isEditable}>
                {existing ? 'Save changes' : 'Submit application'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {existing && !isEditable && renderSummary()}
    </Stack>
  );
};

export default UserApplication;
