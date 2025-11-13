import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { ROUTES, USER_ROLES } from '@/utils/constants';
import './LeaderPending.scss';

const LeaderPending = () => {
  const { currentUser, signOut } = useApp();

  if (currentUser?.leaderStatus === 'approved') {
    if (currentUser.role === USER_ROLES.SESSION_LEADER) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.LEADER_DASHBOARD} replace />;
  }

  return (
    <section className='leader-pending'>
      <div className='leader-pending__card'>
        <h1 className='leader-pending__title'>Leader Access Pending</h1>
        <p className='leader-pending__message'>
          Thanks for volunteering to serve as a leader. An administrator is
          reviewing your request and will approve it soon. You will receive
          access to the leader tools once approved.
        </p>
        <p className='leader-pending__hint'>
          You can sign out for now or return later to check the status of your
          request.
        </p>
        <Button type='button' onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </section>
  );
};

export default LeaderPending;
