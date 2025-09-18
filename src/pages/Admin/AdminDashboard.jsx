import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import './AdminDashboard.scss';

const GENDER_COLORS = {
  male: '#4f46e5',
  female: '#f97316',
  other: '#6b7280',
  'No Data': '#d1d5db',
};

const AdminDashboard = () => {
  const { applications } = useApp();
  const navigate = useNavigate();

  const { totals, weeklyTrend, genderSplit, stakeWardCounts } = useMemo(() => {
    const totalApplications = applications.length;
    const awaitingCount = applications.filter((app) => app.status === 'awaiting').length;
    const approvedCount = applications.filter((app) => app.status === 'approved').length;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todaysCount = applications.filter((app) => {
      const created = new Date(app.createdAt);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === todayDate.getTime();
    }).length;

    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    const weeklyTrendData = days.map((date) => {
      const dayLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const count = applications.filter((app) => {
        const created = new Date(app.createdAt);
        created.setHours(0, 0, 0, 0);
        return created.getTime() === date.getTime();
      }).length;
      return { day: dayLabel, applications: count };
    });

    const genderCounts = applications.reduce(
      (acc, app) => {
        const key = app.gender && ['male', 'female'].includes(app.gender) ? app.gender : 'other';
        acc[key] += 1;
        return acc;
      },
      { male: 0, female: 0, other: 0 },
    );

    const genderSplitData = Object.entries(genderCounts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ name: key, value }));

    const stakeWardMap = applications.reduce((acc, app) => {
      const stakeKey = app.stake ?? 'Unknown Stake';
      const wardKey = app.ward ?? 'Unknown Ward';
      const composedKey = `${stakeKey} | ${wardKey}`;
      acc[composedKey] = (acc[composedKey] ?? 0) + 1;
      return acc;
    }, {});

    const stakeWardData = Object.entries(stakeWardMap).map(([key, value]) => {
      const [stake, ward] = key.split(' | ');
      return { label: `${stake} - ${ward}`, applications: value };
    });

    return {
      totals: {
        totalApplications,
        awaitingCount,
        approvedCount,
        todaysCount,
      },
      weeklyTrend: weeklyTrendData,
      genderSplit: genderSplitData,
      stakeWardCounts: stakeWardData,
    };
  }, [applications]);

  const pieData = genderSplit.length ? genderSplit : [{ name: 'No Data', value: 1 }];

  const goToAwaiting = () => {
    navigate('/admin/review', { state: { initialTab: 'awaiting' } });
  };

  const goToApproved = () => {
    navigate('/admin/review', { state: { initialTab: 'approved' } });
  };

  const goToNewToday = () => {
    navigate('/admin/review', { state: { initialTab: 'all', focus: 'today' } });
  };

  return (
    <section className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>
      <p className="dashboard__subtitle">Overview of application activity</p>

      <div className="dashboard__summary">
        <div className="summary-card summary-card--primary">
          <div className="summary-card__icon" aria-hidden>
            <span>📥</span>
          </div>
          <div className="summary-card__content">
            <span className="summary-card__label">Total Applications</span>
            <span className="summary-card__value">{totals.totalApplications}</span>
          </div>
          <span className="summary-card__spark">All time</span>
        </div>
        <button
          type="button"
          className="summary-card summary-card--warning summary-card--clickable"
          onClick={goToAwaiting}
          aria-label="View awaiting review applications"
        >
          <div className="summary-card__icon" aria-hidden>
            <span>⏳</span>
          </div>
          <div className="summary-card__content">
            <span className="summary-card__label">Awaiting Review</span>
            <span className="summary-card__value">{totals.awaitingCount}</span>
          </div>
          <span className="summary-card__spark">Needs action</span>
        </button>
        <button
          type="button"
          className="summary-card summary-card--success summary-card--clickable"
          onClick={goToApproved}
          aria-label="View approved applications"
        >
          <div className="summary-card__icon" aria-hidden>
            <span>🏅</span>
          </div>
          <div className="summary-card__content">
            <span className="summary-card__label">Approved</span>
            <span className="summary-card__value">{totals.approvedCount}</span>
          </div>
          <span className="summary-card__spark">Approved applicants</span>
        </button>
        <button
          type="button"
          className="summary-card summary-card--accent summary-card--clickable"
          onClick={goToNewToday}
          aria-label="View applications submitted today"
        >
          <div className="summary-card__icon" aria-hidden>
            <span>✨</span>
          </div>
          <div className="summary-card__content">
            <span className="summary-card__label">New Today</span>
            <span className="summary-card__value">{totals.todaysCount}</span>
          </div>
          <span className="summary-card__spark">Since midnight</span>
        </button>
      </div>

      <div className="dashboard__grid">
        <div className="panel">
          <h2 className="panel__title">Past 7 Days</h2>
          <div className="panel__chart">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#4b5563" />
                <YAxis allowDecimals={false} stroke="#4b5563" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel__title">Gender Split</h2>
          <div className="panel__chart">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={GENDER_COLORS[entry.name] ?? '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel panel--wide">
        <h2 className="panel__title">Stake &amp; Ward Distribution</h2>
        <div className="panel__chart">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stakeWardCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#4b5563" />
              <YAxis allowDecimals={false} stroke="#4b5563" />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="#34d399" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
