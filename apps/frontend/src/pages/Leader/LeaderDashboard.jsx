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
import { ROUTES } from '../../utils/constants.js';
import './LeaderDashboard.scss';

const PIE_COLORS = ['#2563eb', '#1e3a8a', '#64748b'];

const LeaderDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, applications, leaderRecommendations } = useApp();
  const leaderId = currentUser?.id ?? null;

  const recommendations = useMemo(
    () =>
      leaderRecommendations
        .filter((recommendation) => recommendation.leaderId === leaderId)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [leaderRecommendations, leaderId]
  );

  const applicantsInStake = useMemo(() => {
    if (!currentUser?.stake) {
      return [];
    }

    const linkedApplicationIds = new Set(
      recommendations
        .filter((rec) => rec.linkedApplicationId)
        .map((rec) => rec.linkedApplicationId)
    );

    return applications.filter((app) => {
      const inStake = app.stake === currentUser.stake;
      const notRecommended = !linkedApplicationIds.has(app.id);
      return inStake && notRecommended;
    });
  }, [applications, currentUser, recommendations]);

  const combinedItems = useMemo(() => {
    if (!currentUser?.stake) {
      return [];
    }

    const applicationById = new Map();
    applications
      .filter((app) => app.stake === currentUser.stake)
      .forEach((app) => {
        applicationById.set(app.id, app);
      });

    const mappedRecommendations = recommendations.map((rec) => ({
      ...rec,
      hasApplication: rec.linkedApplicationId && applicationById.has(rec.linkedApplicationId),
    }));

    const mappedApplications = applicantsInStake.map((app) => ({
      ...app,
      isApplication: true,
    }));

    return [...mappedRecommendations, ...mappedApplications];
  }, [recommendations, applicantsInStake, applications, currentUser]);

  const statusCounts = useMemo(
    () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return {
        draft: recommendations.filter(
          (recommendation) => recommendation.status === 'draft'
        ).length,
        submitted: recommendations.filter(
          (recommendation) => recommendation.status === 'submitted' || recommendation.status === 'approved' || recommendation.status === 'rejected'
        ).length,
        applications: applicantsInStake.length,
        newRecommendationsToday: recommendations.filter(
          (recommendation) => new Date(recommendation.createdAt) >= today
        ).length,
        newApplicationsToday: applicantsInStake.filter(
          (app) => new Date(app.createdAt) >= today
        ).length,
      };
    },
    [recommendations, applicantsInStake]
  );

  const locationCounts = useMemo(() => {
    const groups = combinedItems.reduce((acc, item) => {
      const stake = item.stake || 'Unknown Stake';
      const ward = item.ward || 'Unknown Ward';
      const key = `${stake} • ${ward}`;
      if (!acc[key]) {
        acc[key] = { recommendations: 0, applications: 0 };
      }
      if (item.isApplication) {
        acc[key].applications += 1;
      } else {
        acc[key].recommendations += 1;
      }
      return acc;
    }, {});
    return Object.entries(groups).map(([name, counts]) => ({ 
      name, 
      Recommendations: counts.recommendations,
      Applications: counts.applications
    }));
  }, [combinedItems]);

  const genderCounts = useMemo(() => {
    const map = combinedItems.reduce((acc, item) => {
      const key =
        item.gender === 'male' || item.gender === 'female'
          ? item.gender
          : 'Unspecified';
      if (!acc[key]) {
        acc[key] = { recommendations: 0, applications: 0 };
      }
      if (item.isApplication) {
        acc[key].applications += 1;
      } else {
        acc[key].recommendations += 1;
      }
      return acc;
    }, {});
    return Object.entries(map).map(([name, counts]) => ({ 
      name, 
      Recommendations: counts.recommendations,
      Applications: counts.applications,
      value: counts.recommendations + counts.applications
    }));
  }, [combinedItems]);

  const pieData = genderCounts.length
    ? genderCounts
    : [{ name: 'No Data', value: 1 }];

  const handleCreateRecommendation = () => {
    navigate(ROUTES.LEADER_RECOMMENDATIONS, { state: { action: 'create' } });
  };

  return (
    <section className='leader-dashboard'>
      <header className='leader-dashboard__header'>
        <div className='leader-dashboard__intro'>
          <h1 className='leader-dashboard__title'>Leader Dashboard</h1>
          <p className='leader-dashboard__subtitle'>
            Monitor your recommendations and see where your applicants are
            coming from.
          </p>
        </div>
        <Button
          type='button'
          variant='primary'
          onClick={handleCreateRecommendation}
        >
          Create Recommendation
        </Button>
      </header>

      <div className='leader-dashboard__stats'>
        <div className='leader-dashboard__stat-card'>
          <span className='leader-dashboard__stat-label'>
            Draft Recommendations
          </span>
          <span className='leader-dashboard__stat-value'>
            {statusCounts.draft}
          </span>
        </div>
        <div className='leader-dashboard__stat-card'>
          <span className='leader-dashboard__stat-label'>
            Submitted Recommendations
          </span>
          <span className='leader-dashboard__stat-value'>
            {statusCounts.submitted}
          </span>
        </div>
        <div className='leader-dashboard__stat-card'>
          <span className='leader-dashboard__stat-label'>
            Applications in Stake
          </span>
          <span className='leader-dashboard__stat-value'>
            {statusCounts.applications}
          </span>
        </div>
        <div className='leader-dashboard__stat-card'>
          <span className='leader-dashboard__stat-label'>
            New Recommendations Today
          </span>
          <span className='leader-dashboard__stat-value'>
            {statusCounts.newRecommendationsToday}
          </span>
        </div>
        <div className='leader-dashboard__stat-card'>
          <span className='leader-dashboard__stat-label'>
            New Applications Today
          </span>
          <span className='leader-dashboard__stat-value'>
            {statusCounts.newApplicationsToday}
          </span>
        </div>
      </div>

      <div className='leader-dashboard__charts'>
        <div className='leader-dashboard__chart'>
          <h2 className='leader-dashboard__chart-title'>
            Stake &amp; Ward Distribution
          </h2>
          {locationCounts.length ? (
            <ResponsiveContainer width='100%' height={260}>
              <BarChart data={locationCounts}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                <XAxis dataKey='name' stroke='#64748b' style={{ fontSize: '0.75rem' }} />
                <YAxis allowDecimals={false} stroke='#64748b' style={{ fontSize: '0.75rem' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                <Bar
                  dataKey='Recommendations'
                  fill='#2563eb'
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey='Applications'
                  fill='#1e3a8a'
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className='leader-dashboard__empty'>
              No data yet to show location distribution.
            </p>
          )}
        </div>
        <div className='leader-dashboard__chart'>
          <h2 className='leader-dashboard__chart-title'>Gender Breakdown</h2>
          <ResponsiveContainer width='100%' height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey='value'
                nameKey='name'
                innerRadius={50}
                outerRadius={90}
                paddingAngle={4}
                label={(entry) => entry.name}
                style={{ fontSize: '0.75rem' }}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '0.875rem' }} />
              <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default LeaderDashboard;
