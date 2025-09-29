import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import { Button } from '../../components/ui';
import './LeaderDashboard.scss';

const PIE_COLORS = ['#2563eb', '#1e3a8a', '#64748b'];

const LeaderDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, leaderRecommendations } = useApp();
  const leaderId = currentUser?.id ?? null;

  const recommendations = useMemo(
    () =>
      leaderRecommendations
        .filter((recommendation) => recommendation.leaderId === leaderId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [leaderRecommendations, leaderId],
  );

  const statusCounts = useMemo(
    () => ({
      draft: recommendations.filter((recommendation) => recommendation.status === 'draft').length,
      submitted: recommendations.filter((recommendation) => recommendation.status === 'submitted').length,
    }),
    [recommendations],
  );

  const locationCounts = useMemo(() => {
    const groups = recommendations.reduce((acc, recommendation) => {
      const stake = recommendation.stake || 'Unknown Stake';
      const ward = recommendation.ward || 'Unknown Ward';
      const key = `${stake} • ${ward}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups).map(([name, total]) => ({ name, total }));
  }, [recommendations]);

  const genderCounts = useMemo(() => {
    const map = recommendations.reduce(
      (acc, recommendation) => {
        const key = recommendation.gender === 'male' || recommendation.gender === 'female'
          ? recommendation.gender
          : 'Unspecified';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {},
    );
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [recommendations]);

  const pieData = genderCounts.length ? genderCounts : [{ name: 'No Data', value: 1 }];

  const handleCreateRecommendation = () => {
    navigate('/leader/recommendations', { state: { action: 'create' } });
  };

  return (
    <section className="leader-dashboard">
      <header className="leader-dashboard__header">
        <div className="leader-dashboard__intro">
          <h1 className="leader-dashboard__title">Leader Dashboard</h1>
          <p className="leader-dashboard__subtitle">
            Monitor your recommendations and see where your applicants are coming from.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={handleCreateRecommendation}>
          Create Recommendation
        </Button>
      </header>

      <div className="leader-dashboard__stats">
        <div className="leader-dashboard__stat-card">
          <span className="leader-dashboard__stat-label">Draft Recommendations</span>
          <span className="leader-dashboard__stat-value">{statusCounts.draft}</span>
        </div>
        <div className="leader-dashboard__stat-card">
          <span className="leader-dashboard__stat-label">Submitted Recommendations</span>
          <span className="leader-dashboard__stat-value">{statusCounts.submitted}</span>
        </div>
      </div>

      <div className="leader-dashboard__charts">
        <div className="leader-dashboard__chart">
          <h2 className="leader-dashboard__chart-title">Stake &amp; Ward Distribution</h2>
          {locationCounts.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={locationCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#2563eb" name="Recommendations" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="leader-dashboard__empty">No recommendations yet to show location data.</p>
          )}
        </div>
        <div className="leader-dashboard__chart">
          <h2 className="leader-dashboard__chart-title">Gender Breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default LeaderDashboard;
