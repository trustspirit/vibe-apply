import { Outlet } from 'react-router-dom';
import GlobalNav from '../components/GlobalNav';
import './AppLayout.scss';

const AppLayout = () => {
  return (
    <div className='app-shell'>
      <GlobalNav />
      <main className='app-shell__content'>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
