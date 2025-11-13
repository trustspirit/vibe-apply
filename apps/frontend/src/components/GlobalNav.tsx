import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { getRoleConfig } from '@/utils/roleConfig';
import styles from './GlobalNav.module.scss';

const GlobalNav = () => {
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();
  const gnbRef = useRef<HTMLElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const { navItems, greeting: roleGreeting, label: roleLabel } = getRoleConfig(
    currentUser.role,
    currentUser.leaderStatus
  );
  const hasNav = navItems.length > 0;

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
