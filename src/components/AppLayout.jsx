import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav.jsx';

const hiddenPaths = ['/signin', '/signup'];

const AppLayout = () => {
  const location = useLocation();
  const showNav = !hiddenPaths.includes(location.pathname);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {showNav && <TopNav />}
      <Container
        maxWidth="lg"
        sx={{
          pt: showNav ? { xs: 10, md: 12 } : { xs: 6, md: 8 },
          pb: 6,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default AppLayout;
