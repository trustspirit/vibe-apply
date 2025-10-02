import axios, { AxiosError } from 'axios';
import {
  User,
  UserRole,
  LeaderStatus,
  Application,
  ApplicationStatus,
  LeaderRecommendation,
  RecommendationStatus,
} from '@vibe-apply/shared';

interface ErrorData {
  message: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data: ErrorData;

  constructor(message: string, status: number, data: ErrorData) {
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
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ErrorData>) => {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: 'An error occurred' };

    throw new ApiError(errorData.message || `HTTP ${status}`, status, errorData);
  }
);

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface ProfileData {
  ward: string;
  stake: string;
  role: UserRole;
  phone?: string;
}

export const authApi = {
  signIn: async (data: SignInData): Promise<User> => {
    await api.post('/auth/signin', data);
    return api.get('/auth/profile');
  },

  signUp: async (data: SignUpData): Promise<User> => {
    await api.post('/auth/signup', data);
    return api.get('/auth/profile');
  },

  signOut: async (): Promise<void> => {
    localStorage.removeItem('vibe-apply-session');

    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.warn('Sign out request failed:', error);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    return api.get('/auth/profile');
  },

  completeProfile: async (profileData: ProfileData): Promise<User> => {
    return api.put('/auth/profile/complete', profileData);
  },

  updateProfile: async (profileData: Partial<ProfileData>): Promise<User> => {
    return api.put('/auth/profile', profileData);
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return api.get('/auth/users');
  },

  updateRole: async (userId: string, role: UserRole): Promise<User> => {
    return api.put(`/auth/users/${userId}/role`, { role });
  },

  updateLeaderStatus: async (userId: string, status: LeaderStatus): Promise<User> => {
    return api.put(`/auth/users/${userId}/leader-status`, { leaderStatus: status });
  },
};

interface ApplicationFormData {
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: string;
  moreInfo: string;
}

export const applicationsApi = {
  getAll: async (): Promise<Application[]> => {
    return api.get('/applications');
  },

  getByUser: async (userId: string): Promise<Application[]> => {
    return api.get(`/applications/user/${userId}`);
  },

  getMyApplication: async (): Promise<Application | null> => {
    return api.get('/applications/my-application');
  },

  submit: async (applicationData: ApplicationFormData): Promise<Application> => {
    return api.post('/applications', applicationData);
  },

  update: async (applicationId: string, applicationData: Partial<ApplicationFormData>): Promise<Application> => {
    return api.put(`/applications/${applicationId}`, applicationData);
  },

  updateStatus: async (applicationId: string, status: ApplicationStatus): Promise<Application> => {
    return api.patch(`/applications/${applicationId}/status`, { status });
  },
};

interface RecommendationFormData {
  name: string;
  age: number;
  email: string;
  phone: string;
  stake: string;
  ward: string;
  gender: string;
  moreInfo: string;
}

export const recommendationsApi = {
  getAll: async (): Promise<LeaderRecommendation[]> => {
    return api.get('/recommendations');
  },

  getByLeader: async (leaderId: string): Promise<LeaderRecommendation[]> => {
    return api.get(`/recommendations/leader/${leaderId}`);
  },

  getMyRecommendations: async (): Promise<LeaderRecommendation[]> => {
    return api.get('/recommendations/my-recommendations');
  },

  submit: async (recommendationData: RecommendationFormData): Promise<LeaderRecommendation> => {
    return api.post('/recommendations', recommendationData);
  },

  update: async (
    recommendationId: string,
    recommendationData: Partial<RecommendationFormData>
  ): Promise<LeaderRecommendation> => {
    return api.put(`/recommendations/${recommendationId}`, recommendationData);
  },

  updateStatus: async (recommendationId: string, status: RecommendationStatus): Promise<LeaderRecommendation> => {
    return api.patch(`/recommendations/${recommendationId}/status`, { status });
  },

  delete: async (recommendationId: string): Promise<void> => {
    return api.delete(`/recommendations/${recommendationId}`);
  },
};
