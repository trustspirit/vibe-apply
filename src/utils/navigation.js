export const getDefaultPathForUser = (user) => {
  if (!user) {
    return '/signin';
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
