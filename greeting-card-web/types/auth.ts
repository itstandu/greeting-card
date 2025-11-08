export type UserRole = 'CUSTOMER' | 'ADMIN';

export type User = {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type TokenResponse = {
  accessToken: string;
  tokenType?: 'Bearer';
  expiresIn?: number;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  expiresIn?: number;
  message?: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  error: string | null;
};
