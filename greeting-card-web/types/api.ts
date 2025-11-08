export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp?: number;
  pagination?: PaginationResponse;
};

export type PaginationResponse = {
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export type PaginationParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

export type PaginatedApiResponse<T> = ApiResponse<T[]> & {
  pagination: PaginationResponse;
};
