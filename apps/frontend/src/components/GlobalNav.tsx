import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useApp } from '@/context/AppContext';
import { Avatar, StatusChip } from '@/components/ui';
import { ROUTES, getRoleTone } from '@/utils/constants';
import { getRoleConfig } from '@/utils/roleConfig';
import styles from './GlobalNav.module.scss';

const GlobalNav = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();
  const gnbRef = useRef<HTMLElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const { navItems, label: roleLabel } = getRoleConfig(
    currentUser.role,
    currentUser.leaderStatus,
    t
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

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowMenu(false);
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
        document.documentElement.style.setProperty(
          '--gnb-height',
          `${height}px`
        );
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
          className={
            hasNav
              ? clsx(styles.placeholder, styles.placeholderActive)
              : styles.placeholder
          }
          aria-hidden
        />
        {hasNav ? (
          <nav className={styles.links} aria-label='Main navigation'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(styles.link, isActive && styles.linkActive)
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
        <div className={styles.profile}>
          <div className={styles.profileInfo}>
            <span className={styles.greeting}>
              {(() => {
                const hi = t('leader.greeting.hi');
                let displayName =
                  currentUser.name?.trim() ||
                  (() => {
                    const roleTone = getRoleTone(currentUser.role);
                    return t(`leader.greeting.${roleTone}`);
                  })();
                displayName = displayName.replace(/\s*\([^)]*\)/g, '').trim();
                return `${hi}, ${displayName}`;
              })()}
            </span>
            <StatusChip
              status={currentUser.role}
              tone={getRoleTone(currentUser.role)}
              label={roleLabel}
              className={styles.roleChip}
            />
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
                  onClick={() =>
                    handleMenuAction(() => navigate(ROUTES.ACCOUNT_SETTINGS))
                  }
                >
                  {t('navigation.accountSettings')}
                </button>
                <div className={styles.menuDivider} />
                <div className={styles.languageSection}>
                  <div className={styles.languageLabel}>
                    {t('navigation.language')}
                  </div>
                  <div className={styles.languageButtons}>
                    <button
                      className={clsx(
                        styles.languageButton,
                        i18n.language === 'ko' && styles.languageButtonActive
                      )}
                      onClick={() => handleLanguageChange('ko')}
                    >
                      한국어
                    </button>
                    <button
                      className={clsx(
                        styles.languageButton,
                        i18n.language === 'en' && styles.languageButtonActive
                      )}
                      onClick={() => handleLanguageChange('en')}
                    >
                      English
                    </button>
                  </div>
                </div>
                <div className={styles.menuDivider} />
                <button
                  className={styles.menuItem}
                  onClick={() => handleMenuAction(handleSignOut)}
                >
                  {t('navigation.signOut')}
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
