import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Button } from './ui';
import { USER_ROLES, LEADER_STATUS, ROUTES } from '../utils/constants.js';
import './GlobalNav.scss';

const GlobalNav = () => {
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();
  const gnbRef = useRef(null);

  const navItems = (() => {
    if (currentUser.role === USER_ROLES.ADMIN) {
      return [
        { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
        { to: ROUTES.ADMIN_REVIEW, label: 'Review Applications' },
        { to: ROUTES.ADMIN_ROLES, label: 'Manage Roles' },
      ];
    }
    if (currentUser.role === USER_ROLES.LEADER) {
      if (currentUser.leaderStatus === LEADER_STATUS.APPROVED) {
        return [
          { to: ROUTES.LEADER_DASHBOARD, label: 'Leader Dashboard' },
          { to: ROUTES.LEADER_RECOMMENDATIONS, label: 'Recommendations' },
        ];
      }
      return [
        { to: ROUTES.LEADER_PENDING, label: 'Leader Access' },
        { to: ROUTES.LEADER_RECOMMENDATIONS, label: 'Recommendations' },
      ];
    }
    if (currentUser.role === USER_ROLES.APPLICANT) {
      return [{ to: ROUTES.APPLICATION, label: 'Application' }];
    }
    return [];
  })();
  const hasNav = navItems.length > 0;

  const roleLabel = (() => {
    if (currentUser.role === USER_ROLES.ADMIN) {
      return 'Admin';
    }
    if (currentUser.role === USER_ROLES.LEADER) {
      return currentUser.leaderStatus === LEADER_STATUS.APPROVED ? 'Leader' : 'Leader (Pending)';
    }
    return 'Applicant';
  })();

  const handleSignOut = () => {
    signOut();
    navigate(ROUTES.SIGN_IN);
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

  if (!currentUser) {
    return null;
  }

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
