import { PaginationResponse } from './api';

export type ServiceResponse<T> = {
  data: T;
  message?: string;
  pagination?: PaginationResponse;
};
