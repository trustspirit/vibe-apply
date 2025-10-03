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
      const code = searchParams.get('code');

      if (!code) {
        navigate(ROUTES.SIGN_IN);
        return;
      }

      try {
        const response = await authApi.exchangeAuthorizationCode(code);
        tokenStorage.setTokens(response.accessToken, response.refreshToken);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        const user = await authApi.getCurrentUser();
        setUser(user);

        if (!user.role || !user.stake || !user.ward) {
          navigate(ROUTES.COMPLETE_PROFILE);
          return;
        }

        switch (user.role) {
          case USER_ROLES.ADMIN:
          case USER_ROLES.SESSION_LEADER:
            navigate(ROUTES.ADMIN_ROOT);
            break;
          case USER_ROLES.BISHOP:
          case USER_ROLES.STAKE_PRESIDENT:
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
