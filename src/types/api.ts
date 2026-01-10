export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
}
