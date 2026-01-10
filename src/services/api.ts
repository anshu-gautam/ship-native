import { NetworkErrorType, networkInterceptor } from '@/lib/networkInterceptor';
import { logError } from '@/lib/sentry';
import type { ApiError, ApiResponse } from '@/types';
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Check rate limit before making request
        if (!networkInterceptor.checkRateLimit()) {
          const error = new Error('Rate limit exceeded') as Error & { isRateLimitError: boolean };
          error.isRateLimitError = true;
          return Promise.reject(error);
        }

        // Add auth token if available
        // You can get the token from your auth store here
        // const token = getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };

        // Classify the error
        const networkError = networkInterceptor.classifyError(error);

        // Log error details
        console.error(`[API] Error: ${networkError.type}`, error.response?.status, error.message);

        // Check if we should retry
        const retryCount = networkInterceptor.getRetryCount(config);
        const shouldRetry = networkError.retryable && retryCount < 3;

        if (shouldRetry && config) {
          try {
            await networkInterceptor.retryRequest(error, retryCount);
            // Retry the request
            return this.client.request(config);
          } catch (retryError) {
            // Max retries reached or error not retryable
            return this.handleError(retryError as AxiosError<ApiError>);
          }
        }

        return this.handleError(error);
      }
    );
  }

  private handleError(error: AxiosError<ApiError>): Promise<never> {
    const networkError = networkInterceptor.classifyError(error);

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || error.code,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };

    // Add network error type to API error
      (apiError as Error & { networkErrorType?: string }).networkErrorType = networkError.type;

    // Log error to Sentry (only for non-retryable errors or after max retries)
    if (!networkError.retryable || networkError.type === NetworkErrorType.CLIENT_ERROR) {
      logError(error as Error, {
        apiError,
        networkErrorType: networkError.type,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    return Promise.reject(apiError);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    this.client.defaults.headers.common.Authorization = undefined;
  }

  /**
   * Clear request cache for deduplication
   */
  clearCache(): void {
    networkInterceptor.clearCache();
  }

  /**
   * Reset rate limiter
   */
  resetRateLimit(): void {
    networkInterceptor.resetRateLimit();
  }
}

export const apiClient = new ApiClient();
