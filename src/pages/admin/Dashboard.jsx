import { Card, CardContent, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { useApplications } from '../../context/ApplicationContext.jsx';

const countByStatus = (applications, status) =>
  applications.filter((app) => app.status === status).length;

const buildSevenDaySeries = (applications) => {
  const today = new Date();
  const days = [...Array(7).keys()].map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - offset));
    const key = date.toISOString().slice(0, 10);
    return { label: key, value: 0 };
  });

  const lookup = days.reduce((acc, { label }) => {
    acc[label] = 0;
    return acc;
  }, {});

  applications.forEach((app) => {
    const submitted = (app.updatedAt || app.createdAt)?.slice(0, 10);
    if (submitted && lookup[submitted] !== undefined) {
      lookup[submitted] += 1;
    }
  });

  return days.map(({ label }) => ({ date: label.slice(5), count: lookup[label] }));
};

const buildGenderPie = (applications) => {
  const base = { male: 0, female: 0 };
  applications.forEach((app) => {
    if (app.gender === 'male') {
      base.male += 1;
    }
    if (app.gender === 'female') {
      base.female += 1;
    }
  });
  return [
    { name: 'Male', value: base.male },
    { name: 'Female', value: base.female },
  ];
};

const buildLocationBars = (applications) => {
  const stakeMap = new Map();
  const wardMap = new Map();

  applications.forEach((app) => {
    if (app.stake) {
      stakeMap.set(app.stake, (stakeMap.get(app.stake) || 0) + 1);
    }
    if (app.ward) {
      wardMap.set(app.ward, (wardMap.get(app.ward) || 0) + 1);
    }
  });

  return [
    ...Array.from(stakeMap.entries()).map(([name, count]) => ({
      name: `${name} Stake`,
      count,
    })),
    ...Array.from(wardMap.entries()).map(([name, count]) => ({
      name: `${name} Ward`,
      count,
    })),
  ];
};

const StatCard = ({ label, value }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={600} mt={1}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { applications } = useApplications();

  const total = applications.length;
  const awaiting = countByStatus(applications, 'awaiting');
  const approved = countByStatus(applications, 'approved');
  const rejected = countByStatus(applications, 'rejected');
  const lineSeries = buildSevenDaySeries(applications);
  const genderPie = buildGenderPie(applications);
  const locationBars = buildLocationBars(applications);

  return (
    <Stack spacing={4}>
      <Typography variant="h4" component="h1">
        Application Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard label="Total Applications" value={total} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard label="Awaiting Review" value={awaiting} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard label="Approved" value={approved} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard label="Rejected" value={rejected} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" mb={2}>
                Past 7 Days Submissions
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" mb={2}>
                Gender Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    label
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ height: 360 }}>
          <Typography variant="h6" mb={2}>
            Stake & Ward Distribution
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationBars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Dashboard;
