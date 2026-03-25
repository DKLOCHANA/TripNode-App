import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { EXPO_PUBLIC_API_BASE_URL } from '@env';
import { SecureStoreService } from '@/data/sources/local/secureStore';
import {
  DomainError,
  NetworkError,
  AuthError,
} from '@/errors/DomainError';

// API base URL from environment - fallback to empty string if not defined
const API_BASE_URL = EXPO_PUBLIC_API_BASE_URL || '';

/**
 * Centralized Axios client with interceptors for:
 * - Token injection
 * - 401 refresh flow
 * - 429 rate limit backoff
 * - Error normalization to DomainError
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token refresh state ──
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

// ── Request interceptor: inject Bearer token ──
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStoreService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle errors ──
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      return handleTokenRefresh(error);
    }

    if (status === 429) {
      return handleRateLimit(error);
    }

    return Promise.reject(normalizeToDomainError(error));
  }
);

/**
 * Handle 401 errors by attempting token refresh
 */
async function handleTokenRefresh(originalError: AxiosError): Promise<AxiosResponse> {
  if (isRefreshing) {
    // Queue the request — resolve when refresh completes
    return new Promise((resolve, reject) => {
      refreshQueue.push((newToken: string) => {
        if (originalError.config) {
          originalError.config.headers = originalError.config.headers || {};
          originalError.config.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient.request(originalError.config));
        } else {
          reject(originalError);
        }
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = await SecureStoreService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Attempt to refresh the token
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    // Store the new tokens
    await SecureStoreService.setToken(data.accessToken);
    if (data.refreshToken) {
      await SecureStoreService.setRefreshToken(data.refreshToken);
    }

    // Resolve all queued requests with new token
    refreshQueue.forEach((cb) => cb(data.accessToken));
    refreshQueue = [];

    // Retry the original request
    if (originalError.config) {
      originalError.config.headers = originalError.config.headers || {};
      originalError.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient.request(originalError.config);
    }

    throw originalError;
  } catch {
    // Refresh failed — clear auth state
    await SecureStoreService.clearAll();

    const authError: AuthError = {
      type: 'AuthError',
      message: 'Session expired. Please sign in again.',
      code: 'SESSION_REVOKED',
    };

    return Promise.reject(authError);
  } finally {
    isRefreshing = false;
  }
}

/**
 * Handle 429 rate limit with exponential backoff
 */
async function handleRateLimit(error: AxiosError): Promise<AxiosResponse> {
  const retryAfter = error.response?.headers?.['retry-after'];
  const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;

  // Wait and retry once
  await new Promise((resolve) => setTimeout(resolve, waitTime));

  if (error.config) {
    return apiClient.request(error.config);
  }

  const networkError: NetworkError = {
    type: 'NetworkError',
    message: 'Too many requests. Please try again later.',
    statusCode: 429,
    retryable: true,
  };

  return Promise.reject(networkError);
}

/**
 * Normalize Axios errors to DomainError types
 */
function normalizeToDomainError(error: AxiosError): DomainError {
  // Network error (no response)
  if (!error.response) {
    return {
      type: 'NetworkError',
      message: 'No internet connection. Please check your network and try again.',
      retryable: true,
    };
  }

  const status = error.response.status;
  const data = error.response.data as Record<string, unknown> | undefined;
  const message = (data?.message as string) || error.message || 'An error occurred';

  // Client errors
  if (status === 400) {
    return {
      type: 'ValidationError',
      message,
      field: data?.field as string | undefined,
    };
  }

  if (status === 401) {
    return {
      type: 'AuthError',
      message: 'Authentication required.',
      code: 'INVALID_CREDENTIALS',
    };
  }

  if (status === 403) {
    return {
      type: 'AuthError',
      message: 'Access denied.',
      code: 'SESSION_REVOKED',
    };
  }

  if (status === 404) {
    return {
      type: 'NotFoundError',
      message: 'Resource not found.',
      resourceId: data?.resourceId as string | undefined,
    };
  }

  // Server errors (5xx) are retryable
  if (status >= 500) {
    return {
      type: 'NetworkError',
      message: 'Server error. Please try again later.',
      statusCode: status,
      retryable: true,
    };
  }

  // Default network error
  return {
    type: 'NetworkError',
    message,
    statusCode: status,
    retryable: false,
  };
}

export { normalizeToDomainError };
