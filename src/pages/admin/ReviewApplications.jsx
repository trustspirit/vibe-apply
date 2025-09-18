import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useApplications } from '../../context/ApplicationContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const statusColor = {
  awaiting: 'warning',
  approved: 'success',
  rejected: 'error',
};

const ReviewApplications = () => {
  const { applications, updateApplicationStatus } = useApplications();
  const { users } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState('');

  const counts = useMemo(() => {
    return applications.reduce(
      (acc, app) => {
        acc.all += 1;
        acc[app.status] += 1;
        return acc;
      },
      { all: 0, awaiting: 0, approved: 0, rejected: 0 },
    );
  }, [applications]);

  const list = useMemo(() => {
    if (activeTab === 'all') {
      return applications;
    }
    return applications.filter((app) => app.status === activeTab);
  }, [activeTab, applications]);

  const selected = useMemo(
    () => list.find((app) => app.id === selectedId) || list[0] || null,
    [list, selectedId],
  );

  const handleTabChange = (_event, value) => {
    setActiveTab(value);
    setSelectedId(null);
    setMessage('');
  };

  const handleStatusUpdate = (nextStatus) => {
    if (!selected) return;
    if (selected.status === nextStatus) return;
    updateApplicationStatus(selected.id, nextStatus);
    setMessage(`Application marked as ${nextStatus}.`);
  };

  const applicantDetails = useMemo(() => {
    if (!selected) return null;
    const owner = users.find((user) => user.id === selected.userId);
    return {
      applicantName: owner?.name || selected.name,
      applicantEmail: owner?.email || selected.email,
    };
  }, [selected, users]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Review Applications
      </Typography>

      <Paper>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={`${tab.label} (${counts[tab.value]})`}
            />
          ))}
        </Tabs>
        <Divider />
        <Grid container>
          <Grid
            xs={12}
            md={4}
            sx={{
              borderRight: { md: '1px solid', xs: 'none' },
              borderColor: 'divider',
              maxHeight: 520,
              overflowY: 'auto',
            }}
          >
            {list.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">No applications in this tab.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {list.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={selected?.id === item.id}
                    onClick={() => setSelectedId(item.id)}
                    alignItems="flex-start"
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Chip
                            label={item.status}
                            color={statusColor[item.status]}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Updated{' '}
                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Grid>
          <Grid xs={12} md={8}>
            <Box sx={{ p: 3 }}>
              {!selected ? (
                <Typography color="text.secondary">
                  Select an application to view details.
                </Typography>
              ) : (
                <Stack spacing={3}>
                  {message && <Alert severity="success">{message}</Alert>}
                  <Box>
                    <Typography variant="h6">Applicant Details</Typography>
                    <Stack spacing={0.5} mt={1}>
                      <Typography>Name: {applicantDetails?.applicantName || 'N/A'}</Typography>
                      <Typography>Email: {applicantDetails?.applicantEmail || 'N/A'}</Typography>
                      <Typography>Phone: {selected.phone || 'N/A'}</Typography>
                      <Typography>Age: {selected.age || 'N/A'}</Typography>
                      <Typography>Gender: {selected.gender || 'N/A'}</Typography>
                      <Typography>Stake: {selected.stake || 'N/A'}</Typography>
                      <Typography>Ward: {selected.ward || 'N/A'}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="h6">Additional Information</Typography>
                    <Typography color="text.secondary" mt={1}>
                      {selected.additionalInfo || 'No additional details provided.'}
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={selected.status === 'approved'}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleStatusUpdate('awaiting')}
                      disabled={selected.status === 'awaiting'}
                    >
                      Move to Awaiting
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={selected.status === 'rejected'}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};

export default ReviewApplications;
