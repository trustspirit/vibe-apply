import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.get('newUser') === 'true';

    // Fetch user profile from API using HTTP-only cookies
    const fetchUserProfile = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setUser(user);

        // If new user, redirect to complete profile
        if (isNewUser) {
          navigate('/auth/complete-profile');
          return;
        }

        // Redirect based on role
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'leader':
            navigate('/leader');
            break;
          default:
            navigate('/application');
        }
      } catch (error) {
        console.error('AuthCallback Debug - Error details:', error);
        console.error(
          'AuthCallback Debug - Redirecting to signin due to error'
        );
        navigate('/signin');
      }
    };

    fetchUserProfile();
  }, [navigate, setUser]);

  return (
    <div className='auth-callback'>
      <div className='auth-callback__container'>
        <div className='auth-callback__loading'>
          <h2>Completing sign in...</h2>
          <p>Please wait while we finish setting up your account.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
