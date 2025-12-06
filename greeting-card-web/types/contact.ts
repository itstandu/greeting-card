import type { PaginationParams } from './api';
import type { ServiceResponse } from './service';

export type ContactStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type ContactCategory = 'support' | 'sales' | 'feedback' | 'partnership' | 'other';

export type ContactMessage = {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  category: ContactCategory | string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt?: string;
};

export type CreateContactRequest = {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  category: ContactCategory | string;
  message: string;
};

export type UpdateContactStatusRequest = {
  status: ContactStatus;
};

export type ContactFilters = PaginationParams & {
  status?: ContactStatus;
  category?: ContactCategory | string;
  search?: string;
};

export type ContactListResponse = ServiceResponse<ContactMessage[]> & {
  pagination?: ServiceResponse<ContactMessage[]>['pagination'];
};
