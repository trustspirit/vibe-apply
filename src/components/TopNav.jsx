import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkStyles = { color: 'inherit', textDecoration: 'none' };

const TopNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Review Applications', path: '/admin/review' },
    { label: 'Manage Roles', path: '/admin/manage-roles' },
  ];

  const userLinks = [{ label: 'My Application', path: '/application' }];

  const links = user.role === 'admin' ? adminLinks : userLinks;

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
        <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600 }}>
          Logout
        </Button>
        <Typography
          component={RouterLink}
          to={user.role === 'admin' ? '/admin/dashboard' : '/application'}
          variant="h6"
          sx={{ ...linkStyles, flexGrow: { xs: 1, md: 0 } }}
        >
          Vibe Apply
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}
        >
          {links.map((link) => (
            <Button
              key={link.path}
              component={RouterLink}
              to={link.path}
              color={isActive(link.path) ? 'secondary' : 'inherit'}
              variant={isActive(link.path) ? 'contained' : 'text'}
              size="small"
            >
              {link.label}
            </Button>
          ))}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
