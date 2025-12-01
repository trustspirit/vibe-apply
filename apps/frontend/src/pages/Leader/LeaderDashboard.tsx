import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { ROUTES, Gender } from '@/utils/constants';
import { CHART_COLORS } from '@/utils/chartConstants';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import { RecommendationStatus } from '@vibe-apply/shared';
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
  const { t } = useTranslation();
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
          (recommendation) => recommendation.status === RecommendationStatus.DRAFT
        ).length,
        submitted: recommendations.filter(
          (recommendation) => recommendation.status === RecommendationStatus.SUBMITTED
        ).length,
        approved: recommendations.filter(
          (recommendation) => recommendation.status === RecommendationStatus.APPROVED
        ).length,
        rejected: recommendations.filter(
          (recommendation) => recommendation.status === RecommendationStatus.REJECTED
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
      const stakeKey = item.stake || 'Unknown Stake';
      const wardKey = item.ward || 'Unknown Ward';
      const key = `${stakeKey} • ${wardKey}`;
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
    return Object.entries(groups).map(([key, counts]): LocationData => {
      const [stakeKey, wardKey] = key.split(' • ');
      const stakeLabel = stakeKey && stakeKey !== 'Unknown Stake'
        ? getStakeLabel(stakeKey) || stakeKey
        : 'Unknown Stake';
      const wardLabel = stakeKey && wardKey && wardKey !== 'Unknown Ward'
        ? getWardLabel(stakeKey, wardKey) || wardKey
        : 'Unknown Ward';
      return {
        name: `${stakeLabel} • ${wardLabel}`,
        Recommendations: counts.recommendations,
        Applications: counts.applications
      };
    });
  }, [combinedItems]);

  const genderCounts = useMemo(() => {
    const map = combinedItems.reduce<Record<string, { recommendations: number; applications: number }>>((acc, item) => {
      const key =
        item.gender === Gender.MALE || item.gender === Gender.FEMALE
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
          <h1 className={styles.title}>{t('leader.dashboard.title')}</h1>
          <p className={styles.subtitle}>
            {t('leader.dashboard.subtitle')}
          </p>
        </div>
        <Button
          type='button'
          variant='primary'
          onClick={handleCreateRecommendation}
        >
          {t('leader.dashboard.createRecommendation')}
        </Button>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            {t('leader.dashboard.stats.draftRecommendations')}
          </span>
          <span className={styles.statValue}>
            {statusCounts.draft}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            {t('leader.dashboard.stats.awaitingReview')}
          </span>
          <span className={styles.statValue}>
            {statusCounts.submitted}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            {t('leader.dashboard.stats.approved')}
          </span>
          <span className={styles.statValue}>
            {statusCounts.approved}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            {t('leader.dashboard.stats.rejected')}
          </span>
          <span className={styles.statValue}>
            {statusCounts.rejected}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            {t('leader.dashboard.stats.applicationsInStake')}
          </span>
          <span className={styles.statValue}>
            {statusCounts.applications}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            {t('leader.dashboard.stats.newRecommendationsToday')}
          </span>
          <span className={styles.statValue}>
            {statusCounts.newRecommendationsToday}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            {t('leader.dashboard.stats.newApplicationsToday')}
          </span>
          <span className={styles.statValue}>
            {statusCounts.newApplicationsToday}
          </span>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chart}>
          <h2 className={styles.chartTitle}>
            {t('leader.dashboard.charts.stakeWardDistribution')}
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
              {t('leader.dashboard.charts.noData')}
            </p>
          )}
        </div>
        <div className={styles.chart}>
          <h2 className={styles.chartTitle}>{t('leader.dashboard.charts.genderBreakdown')}</h2>
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
