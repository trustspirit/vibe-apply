import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  UserRole,
  LeaderStatus,
  Application,
  ApplicationStatus,
  LeaderRecommendation,
  RecommendationStatus,
  TokenResponse,
} from '@vibe-apply/shared';
import { ROUTES } from '../utils/constants';

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

let accessToken: string | null = null;

const getAccessToken = (): string | null => accessToken;
const setAccessToken = (token: string): void => {
  accessToken = token;
};
const clearAccessToken = (): void => {
  accessToken = null;
};

const getRefreshToken = (): string | null =>
  localStorage.getItem('vibe-apply-refresh-token');
const setRefreshToken = (token: string): void => {
  localStorage.setItem('vibe-apply-refresh-token', token);
};
const clearRefreshToken = (): void => {
  localStorage.removeItem('vibe-apply-refresh-token');
};

export const tokenStorage = {
  setTokens: (access: string, refresh: string): void => {
    setAccessToken(access);
    setRefreshToken(refresh);
  },
  clearTokens: (): void => {
    clearAccessToken();
    clearRefreshToken();
  },
};

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: QueueItem[] = [];
const retriedRequests = new Set<string>();

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ErrorData>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    const requestId = `${originalRequest.method}-${originalRequest.url}`;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/signin') || originalRequest.url?.includes('/auth/signup');

    if (error.response?.status === 401 && !retriedRequests.has(requestId) && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            retriedRequests.add(requestId);
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      retriedRequests.add(requestId);
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAccessToken();
        clearRefreshToken();
        retriedRequests.clear();
        const currentPath = window.location.pathname;
        const publicPaths = [
          ROUTES.SIGN_IN,
          ROUTES.SIGN_UP,
          ROUTES.AUTH_CALLBACK,
        ] as string[];
        if (!publicPaths.includes(currentPath)) {
          window.location.href = ROUTES.SIGN_IN;
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<TokenResponse>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/refresh`,
          { refreshToken }
        );
        const { accessToken: newAccessToken } = response.data;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        clearRefreshToken();
        retriedRequests.clear();
        const currentPath = window.location.pathname;
        const publicPaths = [
          ROUTES.SIGN_IN,
          ROUTES.SIGN_UP,
          ROUTES.AUTH_CALLBACK,
        ] as string[];
        if (!publicPaths.includes(currentPath)) {
          window.location.href = ROUTES.SIGN_IN;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: 'An error occurred' };

    throw new ApiError(
      errorData.message || `HTTP ${status}`,
      status,
      errorData
    );
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
  signIn: async (data: SignInData): Promise<Omit<User, 'password'>> => {
    const tokenResponse = (await api.post(
      '/auth/signin',
      data
    )) as TokenResponse;
    setAccessToken(tokenResponse.accessToken);
    setRefreshToken(tokenResponse.refreshToken);
    return tokenResponse.user;
  },

  signUp: async (data: SignUpData): Promise<Omit<User, 'password'>> => {
    const tokenResponse = (await api.post(
      '/auth/signup',
      data
    )) as TokenResponse;
    setAccessToken(tokenResponse.accessToken);
    setRefreshToken(tokenResponse.refreshToken);
    return tokenResponse.user;
  },

  signOut: async (): Promise<void> => {
    localStorage.removeItem('vibe-apply-session');
    clearAccessToken();
    clearRefreshToken();

    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.warn('Sign out request failed:', error);
    }
  },

  exchangeAuthorizationCode: async (
    code: string
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    return api.post('/auth/exchange', { code }) as Promise<{
      accessToken: string;
      refreshToken: string;
    }>;
  },

  refreshAccessToken: async (): Promise<void> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await axios.post<TokenResponse>(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/refresh`,
      { refreshToken }
    );
    setAccessToken(response.data.accessToken);
  },

  getCurrentUser: async (): Promise<User> => {
    return api.get('/auth/profile') as Promise<User>;
  },

  completeProfile: async (profileData: ProfileData): Promise<User> => {
    return api.put('/auth/profile/complete', profileData) as Promise<User>;
  },

  updateProfile: async (profileData: Partial<ProfileData>): Promise<User> => {
    return api.put('/auth/profile', profileData) as Promise<User>;
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return api.get('/auth/users') as Promise<User[]>;
  },

  updateRole: async (userId: string, role: UserRole): Promise<User> => {
    return api.put(`/auth/users/${userId}/role`, { role }) as Promise<User>;
  },

  updateLeaderStatus: async (
    userId: string,
    status: LeaderStatus
  ): Promise<User> => {
    return api.put(`/auth/users/${userId}/leader-status`, {
      leaderStatus: status,
    }) as Promise<User>;
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
    return api.get('/applications') as Promise<Application[]>;
  },

  getByUser: async (userId: string): Promise<Application[]> => {
    return api.get(`/applications/user/${userId}`) as Promise<Application[]>;
  },

  checkRecommendation: async (): Promise<{ hasRecommendation: boolean }> => {
    return api.get('/applications/check-recommendation') as Promise<{
      hasRecommendation: boolean;
    }>;
  },

  getMyApplication: async (): Promise<Application | null> => {
    return api.get(
      '/applications/my-application'
    ) as Promise<Application | null>;
  },

  submit: async (
    applicationData: ApplicationFormData
  ): Promise<Application> => {
    return api.post('/applications', applicationData) as Promise<Application>;
  },

  update: async (
    applicationId: string,
    applicationData: Partial<ApplicationFormData>
  ): Promise<Application> => {
    return api.put(
      `/applications/${applicationId}`,
      applicationData
    ) as Promise<Application>;
  },

  updateStatus: async (
    applicationId: string,
    status: ApplicationStatus
  ): Promise<Application> => {
    return api.patch(`/applications/${applicationId}/status`, {
      status,
    }) as Promise<Application>;
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
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export const recommendationsApi = {
  getAll: async (): Promise<LeaderRecommendation[]> => {
    return api.get('/recommendations') as Promise<LeaderRecommendation[]>;
  },

  getByLeader: async (leaderId: string): Promise<LeaderRecommendation[]> => {
    return api.get(`/recommendations/leader/${leaderId}`) as Promise<
      LeaderRecommendation[]
    >;
  },

  getMyRecommendations: async (): Promise<LeaderRecommendation[]> => {
    return api.get('/recommendations/my-recommendations') as Promise<
      LeaderRecommendation[]
    >;
  },

  submit: async (
    recommendationData: RecommendationFormData
  ): Promise<LeaderRecommendation> => {
    return api.post(
      '/recommendations',
      recommendationData
    ) as Promise<LeaderRecommendation>;
  },

  update: async (
    recommendationId: string,
    recommendationData: Partial<RecommendationFormData>
  ): Promise<LeaderRecommendation> => {
    return api.put(
      `/recommendations/${recommendationId}`,
      recommendationData
    ) as Promise<LeaderRecommendation>;
  },

  updateStatus: async (
    recommendationId: string,
    status: RecommendationStatus
  ): Promise<LeaderRecommendation> => {
    return api.patch(`/recommendations/${recommendationId}/status`, {
      status,
    }) as Promise<LeaderRecommendation>;
  },

  delete: async (recommendationId: string): Promise<void> => {
    return api.delete(`/recommendations/${recommendationId}`) as Promise<void>;
  },
};
