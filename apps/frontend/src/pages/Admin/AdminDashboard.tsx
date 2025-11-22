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
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, SummaryCard } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { GENDER_COLORS } from '@/utils/chartConstants';
import { resetTimeToMidnight } from '@/utils/validationConstants';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import type { Application } from '@vibe-apply/shared';
import styles from './AdminDashboard.module.scss';

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
    const todayDate = resetTimeToMidnight(new Date());
    const todaysApplications = applications.filter((app) => {
      const created = resetTimeToMidnight(new Date(app.createdAt));
      return created.getTime() === todayDate.getTime();
    }).length;
    const todaysRecommendations = submittedRecommendations.filter((rec) => {
      const created = resetTimeToMidnight(new Date(rec.createdAt));
      return created.getTime() === todayDate.getTime();
    }).length;
    const todaysCount = todaysApplications + todaysRecommendations;

    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = resetTimeToMidnight(new Date());
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    const weeklyTrendData: TrendData[] = days.map((date) => {
      const dayLabel = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const appCount = applications.filter((app) => {
        const created = resetTimeToMidnight(new Date(app.createdAt));
        return created.getTime() === date.getTime();
      }).length;
      const recCount = submittedRecommendations.filter((rec) => {
        const created = resetTimeToMidnight(new Date(rec.createdAt));
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
      const [stakeKey, wardKey] = key.split(' | ');
      const stakeLabel = stakeKey && stakeKey !== 'Unknown Stake' 
        ? getStakeLabel(stakeKey) || stakeKey 
        : 'Unknown Stake';
      const wardLabel = stakeKey && wardKey && wardKey !== 'Unknown Ward'
        ? getWardLabel(stakeKey, wardKey) || wardKey
        : 'Unknown Ward';
      const shortStake = stakeLabel.replace(' 스테이크', '').replace(' 지방부', '');
      const shortWard = wardLabel.replace(' 와드', '').replace(' 지부', '');
      return { 
        label: `${shortStake}\n${shortWard}`, 
        fullLabel: `${stakeLabel} - ${wardLabel}`,
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
    <section className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Overview of application activity</p>

      <div className={styles.summaryGrid}>
        <SummaryCard
          label='Total Submissions'
          value={totals.totalSubmissions}
          description={`${totals.totalApplications} apps, ${totals.totalRecommendations} recs`}
          variant='primary'
        />
        <SummaryCard
          label='Awaiting'
          value={totals.awaitingCount}
          description={`${totals.awaitingApplications} apps, ${totals.awaitingRecommendations} recs`}
          variant='warning'
          clickable
          onClick={goToAwaiting}
          aria-label='View awaiting review applications'
        />
        <SummaryCard
          label='Approved'
          value={totals.approvedCount}
          description='Approved applicants'
          variant='success'
          clickable
          onClick={goToApproved}
          aria-label='View approved applications'
        />
        <SummaryCard
          label='New Today'
          value={totals.todaysCount}
          description='Since midnight'
          variant='accent'
          clickable
          onClick={goToNewToday}
          aria-label='View applications submitted today'
        />
      </div>

      <div className={styles.chartsGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Past 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chartContainer}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chartContainer}>
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
          </CardContent>
        </Card>
      </div>

      <Card wide>
        <CardHeader>
          <CardTitle>Stake &amp; Ward Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.chartContainer}>
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
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminDashboard;
