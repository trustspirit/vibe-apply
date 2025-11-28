import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { ROUTES, USER_ROLES } from '@/utils/constants';
import styles from './LeaderPending.module.scss';

const LeaderPending = () => {
  const { t } = useTranslation();
  const { currentUser, signOut } = useApp();

  if (currentUser?.leaderStatus === 'approved') {
    if (currentUser.role === USER_ROLES.SESSION_LEADER) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.LEADER_DASHBOARD} replace />;
  }

  return (
    <section className={styles.leaderPending}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('leader.pending.title')}</h1>
        <p className={styles.message}>
          {t('leader.pending.message')}
        </p>
        <p className={styles.hint}>
          {t('leader.pending.hint')}
        </p>
        <Button type='button' onClick={signOut}>
          {t('leader.pending.signOut')}
        </Button>
      </div>
    </section>
  );
};

export default LeaderPending;
