import { Outlet } from 'react-router-dom';
import GlobalNav from '@/components/GlobalNav';
import styles from './AppLayout.module.scss';

const AppLayout = () => {
  return (
    <div className={styles.shell}>
      <GlobalNav />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
