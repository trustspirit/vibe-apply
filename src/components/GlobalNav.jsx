import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import './GlobalNav.scss';

const GlobalNav = () => {
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const navItems =
    currentUser.role === 'admin'
      ? [
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/review', label: 'Review Applications' },
          { to: '/admin/roles', label: 'Manage Roles' },
        ]
      : [];

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <header className="gnb">
      <div className="gnb__inner">
        <button type="button" className="gnb__logout" onClick={handleSignOut}>
          Logout
        </button>
        {navItems.length ? (
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
        ) : (
          <div className="gnb__spacer" aria-hidden />
        )}
        <div className="gnb__profile">
          <span className="gnb__greeting">Hi, {currentUser.name}</span>
          <span className="gnb__role">{currentUser.role}</span>
        </div>
      </div>
    </header>
  );
};

export default GlobalNav;
