import axios from 'axios';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include HTTP-only cookies
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: 'An error occurred' };
    
    throw new ApiError(
      errorData.message || `HTTP ${status}`,
      status,
      errorData
    );
  }
);

// Auth API
export const authApi = {
  signIn: async ({ email, password }) => {
    const data = await api.post('/auth/signin', { email, password });
    // Tokens are now set as HTTP-only cookies by the backend
    return data;
  },

  signUp: async ({ name, email, password, role }) => {
    const data = await api.post('/auth/signup', { name, email, password, role });
    // Tokens are now set as HTTP-only cookies by the backend
    return data;
  },

  signOut: async () => {
    // Clear any local storage items
    localStorage.removeItem('vibe-apply-session');

    try {
      // Backend should clear HTTP-only cookies
      await api.post('/auth/signout');
    } catch (error) {
      console.warn('Sign out request failed:', error);
    }
  },

  getCurrentUser: async () => {
    return api.get('/auth/profile');
  },

  completeProfile: async (profileData) => {
    return api.put('/auth/profile/complete', profileData);
  },

  updateProfile: async (profileData) => {
    return api.put('/auth/profile', profileData);
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    return api.get('/auth/users');
  },

  updateRole: async (userId, role) => {
    return api.put(`/auth/users/${userId}/role`, { role });
  },

  updateLeaderStatus: async (userId, status) => {
    return api.put(`/auth/users/${userId}/leader-status`, { leaderStatus: status });
  },
};

// Applications API
export const applicationsApi = {
  getAll: async () => {
    return api.get('/applications');
  },

  getByUser: async (userId) => {
    return api.get(`/applications/user/${userId}`);
  },

  getMyApplication: async () => {
    return api.get('/applications/my-application');
  },

  submit: async (applicationData) => {
    return api.post('/applications', applicationData);
  },

  update: async (applicationId, applicationData) => {
    return api.put(`/applications/${applicationId}`, applicationData);
  },

  updateStatus: async (applicationId, status) => {
    return api.patch(`/applications/${applicationId}/status`, { status });
  },
};

// Leader Recommendations API
export const recommendationsApi = {
  getAll: async () => {
    return api.get('/recommendations');
  },

  getByLeader: async (leaderId) => {
    return api.get(`/recommendations/leader/${leaderId}`);
  },

  getMyRecommendations: async () => {
    return api.get('/recommendations/my-recommendations');
  },

  submit: async (recommendationData) => {
    return api.post('/recommendations', recommendationData);
  },

  update: async (recommendationId, recommendationData) => {
    return api.put(`/recommendations/${recommendationId}`, recommendationData);
  },

  updateStatus: async (recommendationId, status) => {
    return api.patch(`/recommendations/${recommendationId}/status`, { status });
  },

  delete: async (recommendationId) => {
    return api.delete(`/recommendations/${recommendationId}`);
  },
};

export { ApiError };
