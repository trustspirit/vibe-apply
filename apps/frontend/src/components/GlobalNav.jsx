import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Button } from './ui';
import './GlobalNav.scss';

const GlobalNav = () => {
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();
  const gnbRef = useRef(null);

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
    if (currentUser.role === 'leader') {
      if (currentUser.leaderStatus === 'approved') {
        return [
          { to: '/leader/dashboard', label: 'Leader Dashboard' },
          { to: '/leader/recommendations', label: 'Recommendations' },
        ];
      }
      return [
        { to: '/leader/pending', label: 'Leader Access' },
        { to: '/leader/recommendations', label: 'Recommendations' },
      ];
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

  // Update CSS custom property with actual GNB height
  useEffect(() => {
    const updateGnbHeight = () => {
      if (gnbRef.current) {
        const height = gnbRef.current.offsetHeight;
        document.documentElement.style.setProperty('--gnb-height', `${height}px`);
      }
    };

    updateGnbHeight();
    
    // Update on resize to handle orientation changes
    const handleResize = () => {
      setTimeout(updateGnbHeight, 100); // Small delay to ensure layout is complete
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentUser]); // Re-run when user changes (different nav items)

  return (
    <header className="gnb" ref={gnbRef}>
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
