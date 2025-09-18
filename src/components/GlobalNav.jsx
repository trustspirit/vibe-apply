import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Button } from './ui';
import './GlobalNav.scss';

const GlobalNav = () => {
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const navItems = (() => {
    if (currentUser.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/review', label: 'Review Applications' },
        { to: '/admin/roles', label: 'Manage Roles' },
      ];
    }
    if (currentUser.role === 'leader' && currentUser.leaderStatus === 'approved') {
      return [{ to: '/leader/dashboard', label: 'Leader Dashboard' }];
    }
    if (currentUser.role === 'applicant') {
      return [{ to: '/application', label: 'Application' }];
    }
    return [];
  })();
  const hasNav = navItems.length > 0;

  const roleLabel = (() => {
    if (currentUser.role === 'admin') {
      return 'Admin';
    }
    if (currentUser.role === 'leader') {
      return currentUser.leaderStatus === 'approved' ? 'Leader' : 'Leader (Pending)';
    }
    return 'Applicant';
  })();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <header className="gnb">
      <div className="gnb__inner">
        <div
          className={hasNav ? 'gnb__placeholder gnb__placeholder--active' : 'gnb__placeholder'}
          aria-hidden
        />
        {hasNav ? (
          <nav className="gnb__nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'gnb__link gnb__link--active' : 'gnb__link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
        <div className="gnb__profile">
          <div className="gnb__profile-info">
            <span className="gnb__greeting">Hi, {currentUser.name}</span>
            <span className="gnb__role">{roleLabel}</span>
          </div>
          <Button type="button" className="gnb__logout" onClick={handleSignOut}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default GlobalNav;
