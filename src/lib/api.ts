import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// ─── Base instance ──────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor — attach JWT ───────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — refresh token on 401 ───────────────────────────
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

function processQueue(token: string) {
  queue.forEach((resolve) => resolve(token));
  queue = [];
}

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.meta && Array.isArray(response.data.data)) {
      const originalData = response.data.data;
      const meta = response.data.meta;
      response.data.data = {
        items: originalData,
        total: meta.total || 0,
        page: meta.page || 1,
        limit: meta.limit || 10,
        totalPages: meta.totalPages || 1,
        hasNext: meta.hasNextPage || false,
        hasPrev: meta.hasPrevPage || false
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
        );
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        Cookies.set('access_token', accessToken, { expires: 1, secure: true, sameSite: 'strict' });
        Cookies.set('refresh_token', newRefreshToken, { expires: 7, secure: true, sameSite: 'strict' });
        processQueue(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        queue = [];
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// ─── Typed helpers ──────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Resource endpoints ──────────────────────────────────────────────────────
export const endpoints = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  hero: { active: '/hero/active', base: '/hero' },
  statistics: { active: '/statistics/active', base: '/statistics' },
  projects: '/projects',
  partners: '/partners',
  blog: '/blog',
  media: '/media',
  videos: '/videos',
  reports: '/reports',
  faq: '/faq',
  testimonials: '/testimonials',
  contact: '/contact',
  newsletter: '/newsletter',
  chatbot: '/chatbot',
  uploads: '/uploads',
  settings: '/settings',
  settingsPublic: '/settings/public',
  seo: '/seo',
  dashboard: {
    summary: '/dashboard/summary',
    activity: '/dashboard/activity',
    messages: '/dashboard/messages',
    topProjects: '/dashboard/top-projects',
    topPosts: '/dashboard/top-posts',
    monthlyStats: '/dashboard/monthly-stats',
  },
  search: '/search',
  categories: {
    base: '/categories',
    projects: '/categories/projects',
    blog: '/categories/blog',
    media: '/categories/media',
    reports: '/categories/reports',
    faq: '/categories/faq',
  },
  tags: '/tags',
  users: '/users',
} as const;
