import { useEffect, useMemo } from 'react';
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
import type { Application } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { CHART_COLORS } from '@/utils/chartConstants';
import styles from './LeaderDashboard.module.scss';

interface LocationData {
  name: string;
  Recommendations: number;
  Applications: number;
}

interface GenderData {
  name: string;
  Recommendations: number;
  Applications: number;
  value: number;
  [key: string]: string | number;
}

interface CombinedItem {
  id?: string;
  name?: string;
  age?: number;
  email?: string;
  phone?: string;
  stake?: string;
  ward?: string;
  gender?: string;
  moreInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  linkedApplicationId?: string;
  isApplication?: boolean;
  hasApplication?: boolean;
}

const LeaderDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, applications, leaderRecommendations, refetchApplications, refetchRecommendations } = useApp();

  useEffect(() => {
    refetchApplications();
    refetchRecommendations();
  }, [refetchApplications, refetchRecommendations]);

  const recommendations = useMemo(
    () =>
      leaderRecommendations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [leaderRecommendations]
  );

  const applicantsInStake = useMemo(() => {
    const linkedApplicationIds = new Set(
      recommendations
        .filter((rec) => rec.linkedApplicationId)
        .map((rec) => rec.linkedApplicationId)
    );

    return applications.filter((app) => {
      const notRecommended = !linkedApplicationIds.has(app.id);
      return notRecommended;
    });
  }, [applications, recommendations]);

  const combinedItems = useMemo(() => {
    if (!currentUser?.stake) {
      return [];
    }

    const applicationById = new Map<string, Application>();
    applications
      .filter((app) => app.stake.toLowerCase() === currentUser.stake.toLowerCase())
      .forEach((app) => {
        applicationById.set(app.id, app);
      });

    const mappedRecommendations: CombinedItem[] = recommendations.map((rec) => ({
      ...rec,
      hasApplication: rec.linkedApplicationId && applicationById.has(rec.linkedApplicationId),
    }));

    const mappedApplications: CombinedItem[] = applicantsInStake.map((app) => ({
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
          (recommendation) => recommendation.status === 'submitted'
        ).length,
        approved: recommendations.filter(
          (recommendation) => recommendation.status === 'approved'
        ).length,
        rejected: recommendations.filter(
          (recommendation) => recommendation.status === 'rejected'
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
    const groups = combinedItems.reduce<Record<string, { recommendations: number; applications: number }>>((acc, item) => {
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
    return Object.entries(groups).map(([name, counts]): LocationData => ({ 
      name, 
      Recommendations: counts.recommendations,
      Applications: counts.applications
    }));
  }, [combinedItems]);

  const genderCounts = useMemo(() => {
    const map = combinedItems.reduce<Record<string, { recommendations: number; applications: number }>>((acc, item) => {
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
    return Object.entries(map).map(([name, counts]): GenderData => ({ 
      name, 
      Recommendations: counts.recommendations,
      Applications: counts.applications,
      value: counts.recommendations + counts.applications
    }));
  }, [combinedItems]);

  const pieData = genderCounts.length
    ? genderCounts
    : [{ name: 'No Data', Recommendations: 0, Applications: 0, value: 1 }];

  const handleCreateRecommendation = () => {
    navigate(ROUTES.LEADER_RECOMMENDATIONS, { state: { action: 'create' } });
  };

  return (
    <section className={styles.leaderDashboard}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Leader Dashboard</h1>
          <p className={styles.subtitle}>
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

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Draft Recommendations
          </span>
          <span className={styles.statValue}>
            {statusCounts.draft}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Awaiting Review
          </span>
          <span className={styles.statValue}>
            {statusCounts.submitted}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Approved
          </span>
          <span className={styles.statValue}>
            {statusCounts.approved}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Rejected
          </span>
          <span className={styles.statValue}>
            {statusCounts.rejected}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            Applications in Stake
          </span>
          <span className={styles.statValue}>
            {statusCounts.applications}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            New Recommendations Today
          </span>
          <span className={styles.statValue}>
            {statusCounts.newRecommendationsToday}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            New Applications Today
          </span>
          <span className={styles.statValue}>
            {statusCounts.newApplicationsToday}
          </span>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chart}>
          <h2 className={styles.chartTitle}>
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
            <p className={styles.empty}>
              No data yet to show location distribution.
            </p>
          )}
        </div>
        <div className={styles.chart}>
          <h2 className={styles.chartTitle}>Gender Breakdown</h2>
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
                    fill={CHART_COLORS.PRIMARY[index % CHART_COLORS.PRIMARY.length]}
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
