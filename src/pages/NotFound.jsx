import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/application');
    } else {
      navigate('/signin');
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 6 }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h3" component="h1">
          404
        </Typography>
        <Typography color="text.secondary">
          The page you are looking for could not be found.
        </Typography>
        <Button variant="contained" onClick={handleBack}>
          Go Back
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFound;
