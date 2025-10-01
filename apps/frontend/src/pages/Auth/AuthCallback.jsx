import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';
import { USER_ROLES, ROUTES } from '../../utils/constants.js';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.get('newUser') === 'true';

    const fetchUserProfile = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setUser(user);

        if (isNewUser) {
          navigate(ROUTES.COMPLETE_PROFILE);
          return;
        }

        switch (user.role) {
          case USER_ROLES.ADMIN:
            navigate(ROUTES.ADMIN_ROOT);
            break;
          case USER_ROLES.LEADER:
            navigate(ROUTES.LEADER_DASHBOARD);
            break;
          default:
            navigate(ROUTES.APPLICATION);
        }
      } catch (error) {
        console.error('AuthCallback Debug - Error details:', error);
        console.error(
          'AuthCallback Debug - Redirecting to signin due to error'
        );
        navigate(ROUTES.SIGN_IN);
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
