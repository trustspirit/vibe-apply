export const getDefaultPathForUser = (user) => {
  if (!user) {
    return '/signin';
  }

  // If user has no role, redirect to complete profile
  if (!user.role) {
    return '/auth/complete-profile';
  }

  if (user.role === 'admin') {
    return '/admin/dashboard';
  }

  if (user.role === 'leader') {
    return user.leaderStatus === 'approved' ? '/leader/dashboard' : '/leader/pending';
  }

  return '/application';
};

export default getDefaultPathForUser;
