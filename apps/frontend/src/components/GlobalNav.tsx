import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useApp } from '../context/AppContext';
import { Avatar } from './ui';
import { USER_ROLES, LEADER_STATUS, ROUTES } from '../utils/constants';
import styles from './GlobalNav.module.scss';

interface NavItem {
  to: string;
  label: string;
}

const GlobalNav = () => {
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();
  const gnbRef = useRef<HTMLElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = (() => {
    if (currentUser.role === USER_ROLES.ADMIN) {
      return [
        { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
        { to: ROUTES.ADMIN_REVIEW, label: 'Review Applications' },
        { to: ROUTES.ADMIN_ROLES, label: 'Manage Roles' },
      ];
    }
    if (currentUser.role === USER_ROLES.SESSION_LEADER) {
      return [
        { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
        { to: ROUTES.ADMIN_REVIEW, label: 'Review Applications' },
      ];
    }
    if (currentUser.role === USER_ROLES.BISHOP || currentUser.role === USER_ROLES.STAKE_PRESIDENT) {
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

  const roleGreeting = (() => {
    if (currentUser.role === USER_ROLES.ADMIN) {
      return 'Admin';
    }
    if (currentUser.role === USER_ROLES.SESSION_LEADER) {
      return 'Session Leader';
    }
    if (currentUser.role === USER_ROLES.BISHOP) {
      return 'Bishop';
    }
    if (currentUser.role === USER_ROLES.STAKE_PRESIDENT) {
      return 'Stake President';
    }
    return 'Applicant';
  })();

  const roleLabel = (() => {
    if (currentUser.role === USER_ROLES.ADMIN) {
      return 'Admin';
    }
    if (currentUser.role === USER_ROLES.SESSION_LEADER) {
      return currentUser.leaderStatus === LEADER_STATUS.APPROVED ? 'Session Leader' : 'Session Leader (Pending)';
    }
    if (currentUser.role === USER_ROLES.BISHOP) {
      return currentUser.leaderStatus === LEADER_STATUS.APPROVED ? 'Bishop' : 'Bishop (Pending)';
    }
    if (currentUser.role === USER_ROLES.STAKE_PRESIDENT) {
      return currentUser.leaderStatus === LEADER_STATUS.APPROVED ? 'Stake President' : 'Stake President (Pending)';
    }
    return 'Applicant';
  })();

  const handleSignOut = () => {
    signOut();
    navigate(ROUTES.SIGN_IN);
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleMenuAction = (action: () => void) => {
    setShowMenu(false);
    action();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const updateGnbHeight = () => {
      if (gnbRef.current) {
        const height = gnbRef.current.offsetHeight;
        document.documentElement.style.setProperty('--gnb-height', `${height}px`);
      }
    };

    updateGnbHeight();
    
    const handleResize = () => {
      setTimeout(updateGnbHeight, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <header className={styles.nav} ref={gnbRef}>
      <div className={styles.container}>
        <div
          className={hasNav ? clsx(styles.placeholder, styles.placeholderActive) : styles.placeholder}
          aria-hidden
        />
        {hasNav ? (
          <nav className={styles.links} aria-label='Main navigation'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
        <div className={styles.profile}>
          <div className={styles.profileInfo}>
            <span className={styles.greeting}>Hi, {roleGreeting}</span>
            <span className={styles.role}>{roleLabel}</span>
          </div>
          <div className={styles.avatarWrapper} ref={avatarRef}>
            <Avatar
              name={currentUser.name}
              picture={currentUser.picture}
              size='md'
              onClick={toggleMenu}
            />
            {showMenu && (
              <div className={styles.menu} ref={menuRef}>
                <button
                  className={styles.menuItem}
                  onClick={() => handleMenuAction(() => navigate(ROUTES.ACCOUNT_SETTINGS))}
                >
                  Account Settings
                </button>
                <button
                  className={styles.menuItem}
                  onClick={() => handleMenuAction(handleSignOut)}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalNav;
