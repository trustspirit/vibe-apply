import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authApi, tokenStorage } from '../../services/api';
import { USER_ROLES, ROUTES } from '../../utils/constants';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (accessToken && refreshToken) {
        // Store tokens from OAuth callback
        tokenStorage.setTokens(accessToken, refreshToken);
      }

      try {
        const user = await authApi.getCurrentUser();
        setUser(user);

        if (!user.role || !user.stake || !user.ward) {
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
        console.error('AuthCallback error:', error);
        navigate(ROUTES.SIGN_IN);
      }
    };

    handleOAuthCallback();
  }, [navigate, setUser, searchParams]);

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
