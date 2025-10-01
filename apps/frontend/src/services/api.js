const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'An error occurred' };
    }

    throw new ApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
};

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('vibe-apply-token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response);
};

// Auth API
export const authApi = {
  signIn: async ({ email, password }) => {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: { email, password },
    });

    if (data.token) {
      localStorage.setItem('vibe-apply-token', data.token);
    }

    return data.user;
  },

  signUp: async ({ name, email, password, role }) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, password, role },
    });

    if (data.token) {
      localStorage.setItem('vibe-apply-token', data.token);
    }

    return data.user;
  },

  signOut: async () => {
    localStorage.removeItem('vibe-apply-token');
    localStorage.removeItem('vibe-apply-session');

    try {
      await apiRequest('/auth/signout', { method: 'POST' });
    } catch (error) {
      console.warn('Sign out request failed:', error);
    }
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    return apiRequest('/users');
  },

  updateRole: async (userId, role) => {
    return apiRequest(`/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    });
  },

  updateLeaderStatus: async (userId, status) => {
    return apiRequest(`/users/${userId}/leader-status`, {
      method: 'PATCH',
      body: { status },
    });
  },
};

// Applications API
export const applicationsApi = {
  getAll: async () => {
    return apiRequest('/applications');
  },

  getByUser: async (userId) => {
    return apiRequest(`/applications/user/${userId}`);
  },

  submit: async (applicationData) => {
    return apiRequest('/applications', {
      method: 'POST',
      body: applicationData,
    });
  },

  update: async (applicationId, applicationData) => {
    return apiRequest(`/applications/${applicationId}`, {
      method: 'PUT',
      body: applicationData,
    });
  },

  updateStatus: async (applicationId, status) => {
    return apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },
};

// Leader Recommendations API
export const recommendationsApi = {
  getAll: async () => {
    return apiRequest('/recommendations');
  },

  getByLeader: async (leaderId) => {
    return apiRequest(`/recommendations/leader/${leaderId}`);
  },

  submit: async (recommendationData) => {
    return apiRequest('/recommendations', {
      method: 'POST',
      body: recommendationData,
    });
  },

  update: async (recommendationId, recommendationData) => {
    return apiRequest(`/recommendations/${recommendationId}`, {
      method: 'PUT',
      body: recommendationData,
    });
  },

  updateStatus: async (recommendationId, status) => {
    return apiRequest(`/recommendations/${recommendationId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  delete: async (recommendationId) => {
    return apiRequest(`/recommendations/${recommendationId}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
