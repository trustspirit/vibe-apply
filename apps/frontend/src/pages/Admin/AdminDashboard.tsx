import { useEffect, useMemo } from 'react';
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
import { useApp } from '../../context/AppContext';
import { ROUTES } from '../../utils/constants';
import type { Application } from '@vibe-apply/shared';
import './AdminDashboard.scss';

const GENDER_COLORS: Record<string, string> = {
  male: '#1d4ed8',
  female: '#f97316',
  other: '#6b7280',
  'No Data': '#d1d5db',
};

interface TrendData {
  day: string;
  applications: number;
  recommendations: number;
}

interface GenderData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StakeWardData {
  label: string;
  fullLabel: string;
  applications: number;
  recommendations: number;
}

const AdminDashboard = () => {
  const { applications, leaderRecommendations, refetchApplications, refetchRecommendations } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    refetchApplications();
    refetchRecommendations();
  }, [refetchApplications, refetchRecommendations]);

  const { totals, weeklyTrend, genderSplit, stakeWardCounts } = useMemo(() => {
    const submittedRecommendations = leaderRecommendations.filter(
      (rec) => rec.status === 'submitted' || rec.status === 'approved' || rec.status === 'rejected'
    );
    const totalApplications = applications.length;
    const totalRecommendations = submittedRecommendations.length;
    const totalSubmissions = totalApplications + totalRecommendations;
    const awaitingApplications = applications.filter((app) => app.status === 'awaiting').length;
    const awaitingRecommendations = leaderRecommendations.filter((rec) => rec.status === 'submitted').length;
    const awaitingCount = awaitingApplications + awaitingRecommendations;
    const approvedCount = applications.filter((app) => app.status === 'approved').length;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todaysApplications = applications.filter((app) => {
      const created = new Date(app.createdAt);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === todayDate.getTime();
    }).length;
    const todaysRecommendations = submittedRecommendations.filter((rec) => {
      const created = new Date(rec.createdAt);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === todayDate.getTime();
    }).length;
    const todaysCount = todaysApplications + todaysRecommendations;

    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    const weeklyTrendData: TrendData[] = days.map((date) => {
      const dayLabel = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const appCount = applications.filter((app) => {
        const created = new Date(app.createdAt);
        created.setHours(0, 0, 0, 0);
        return created.getTime() === date.getTime();
      }).length;
      const recCount = submittedRecommendations.filter((rec) => {
        const created = new Date(rec.createdAt);
        created.setHours(0, 0, 0, 0);
        return created.getTime() === date.getTime();
      }).length;
      return { 
        day: dayLabel, 
        applications: appCount,
        recommendations: recCount,
      };
    });

    const genderCounts = [...applications, ...submittedRecommendations].reduce(
      (acc, item) => {
        const key =
          item.gender && ['male', 'female'].includes(item.gender) ? item.gender : 'other';
        acc[key] += 1;
        return acc;
      },
      { male: 0, female: 0, other: 0 }
    );

    const genderSplitData: GenderData[] = Object.entries(genderCounts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ name: key, value }));

    const stakeWardMap = [...applications, ...submittedRecommendations].reduce((acc, item) => {
      const stakeKey = item.stake ?? 'Unknown Stake';
      const wardKey = item.ward ?? 'Unknown Ward';
      const composedKey = `${stakeKey} | ${wardKey}`;
      if (!acc[composedKey]) {
        acc[composedKey] = { applications: 0, recommendations: 0 };
      }
      if (applications.includes(item as Application)) {
        acc[composedKey].applications += 1;
      } else {
        acc[composedKey].recommendations += 1;
      }
      return acc;
    }, {} as Record<string, { applications: number; recommendations: number }>);

    const stakeWardData: StakeWardData[] = Object.entries(stakeWardMap).map(([key, counts]) => {
      const [stake, ward] = key.split(' | ');
      const shortStake = stake.replace(' Stake', '');
      const shortWard = ward.replace(' Ward', '');
      return { 
        label: `${shortStake}\n${shortWard}`, 
        fullLabel: `${stake} - ${ward}`,
        applications: counts.applications,
        recommendations: counts.recommendations,
      };
    });

    return {
      totals: {
        totalApplications,
        totalRecommendations,
        totalSubmissions,
        awaitingCount,
        awaitingApplications,
        awaitingRecommendations,
        approvedCount,
        todaysCount,
      },
      weeklyTrend: weeklyTrendData,
      genderSplit: genderSplitData,
      stakeWardCounts: stakeWardData,
    };
  }, [applications, leaderRecommendations]);

  const pieData = genderSplit.length ? genderSplit : [{ name: 'No Data', value: 1 }];

  const goToAwaiting = () => {
    navigate(ROUTES.ADMIN_REVIEW, { state: { initialTab: 'awaiting' } });
  };

  const goToApproved = () => {
    navigate(ROUTES.ADMIN_REVIEW, { state: { initialTab: 'approved' } });
  };

  const goToNewToday = () => {
    navigate(ROUTES.ADMIN_REVIEW, { state: { initialTab: 'all', focus: 'today' } });
  };

  return (
    <section className='dashboard'>
      <h1 className='dashboard__title'>Dashboard</h1>
      <p className='dashboard__subtitle'>Overview of application activity</p>

      <div className='dashboard__summary'>
        <div className='summary-card summary-card--primary'>
          <div className='summary-card__icon' aria-hidden>
            <span>📥</span>
          </div>
          <div className='summary-card__content'>
            <span className='summary-card__label'>Total Submissions</span>
            <span className='summary-card__value'>{totals.totalSubmissions}</span>
          </div>
          <span className='summary-card__spark'>{totals.totalApplications} apps, {totals.totalRecommendations} recs</span>
        </div>
        <button
          type='button'
          className='summary-card summary-card--warning summary-card--clickable'
          onClick={goToAwaiting}
          aria-label='View awaiting review applications'
        >
          <div className='summary-card__icon' aria-hidden>
            <span>⏳</span>
          </div>
          <div className='summary-card__content'>
            <span className='summary-card__label'>Awaiting</span>
            <span className='summary-card__value'>{totals.awaitingCount}</span>
          </div>
          <span className='summary-card__spark'>{totals.awaitingApplications} apps, {totals.awaitingRecommendations} recs</span>
        </button>
        <button
          type='button'
          className='summary-card summary-card--success summary-card--clickable'
          onClick={goToApproved}
          aria-label='View approved applications'
        >
          <div className='summary-card__icon' aria-hidden>
            <span>🏅</span>
          </div>
          <div className='summary-card__content'>
            <span className='summary-card__label'>Approved</span>
            <span className='summary-card__value'>{totals.approvedCount}</span>
          </div>
          <span className='summary-card__spark'>Approved applicants</span>
        </button>
        <button
          type='button'
          className='summary-card summary-card--accent summary-card--clickable'
          onClick={goToNewToday}
          aria-label='View applications submitted today'
        >
          <div className='summary-card__icon' aria-hidden>
            <span>✨</span>
          </div>
          <div className='summary-card__content'>
            <span className='summary-card__label'>New Today</span>
            <span className='summary-card__value'>{totals.todaysCount}</span>
          </div>
          <span className='summary-card__spark'>Since midnight</span>
        </button>
      </div>

      <div className='dashboard__grid'>
        <div className='panel'>
          <h2 className='panel__title'>Past 7 Days</h2>
          <div className='panel__chart'>
            <ResponsiveContainer width='100%' height={240}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='day' stroke='#4b5563' />
                <YAxis allowDecimals={false} stroke='#4b5563' />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='applications'
                  stroke='#2563eb'
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name='Applications'
                />
                <Line
                  type='monotone'
                  dataKey='recommendations'
                  stroke='#10b981'
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name='Recommendations'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='panel'>
          <h2 className='panel__title'>Gender Split</h2>
          <div className='panel__chart'>
            <ResponsiveContainer width='100%' height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={GENDER_COLORS[entry.name] ?? '#9ca3af'}
                    />
                  ))}
                </Pie>
              <Tooltip 
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    return payload[0].payload.fullLabel || label;
                  }
                  return label;
                }}
              />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='panel panel--wide'>
        <h2 className='panel__title'>Stake &amp; Ward Distribution</h2>
        <div className='panel__chart'>
          <ResponsiveContainer width='100%' height={320}>
            <BarChart data={stakeWardCounts}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis 
                dataKey='label' 
                stroke='#4b5563' 
                angle={-45}
                textAnchor='end'
                height={80}
                fontSize={12}
                interval={0}
              />
              <YAxis allowDecimals={false} stroke='#4b5563' />
              <Tooltip />
              <Legend />
              <Bar dataKey='applications' fill='#2563eb' name='Applications' />
              <Bar dataKey='recommendations' fill='#10b981' name='Recommendations' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
