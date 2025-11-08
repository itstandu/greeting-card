import { syncCartAfterLogin } from '@/lib/utils/cart-sync';
import { syncWishlistAfterLogin } from '@/lib/utils/wishlist-sync';
import * as authService from '@/services/auth.service';
import {
  clearAccessToken as clearStoredAccessToken,
  setAccessToken as setStoredAccessToken,
} from '@/services/token-manager';
import type { AuthState, LoginRequest, RegisterRequest, User } from '@/types';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasCheckedAuth: false,
  error: null,
};

// Async thunks for auth operations
export const registerUser = createAsyncThunk(
  'auth/register',
  async (request: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(request);
      return { user: response.data, message: response.message };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại';
      return rejectWithValue(message);
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (request: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(request);
      setStoredAccessToken(response.data.accessToken);

      // Sync cart từ localStorage lên server sau khi login thành công
      try {
        const syncSuccess = await syncCartAfterLogin();
        if (syncSuccess) {
          console.log('Cart synced successfully after login');
        }
      } catch (syncError) {
        // Log error nhưng không block login
        console.error('Failed to sync cart after login:', syncError);
      }

      // Sync wishlist từ localStorage lên server sau khi login thành công
      try {
        const syncSuccess = await syncWishlistAfterLogin();
        if (syncSuccess) {
          console.log('Wishlist synced successfully after login');
        }
      } catch (syncError) {
        // Log error nhưng không block login
        console.error('Failed to sync wishlist after login:', syncError);
      }

      return {
        user: response.data.user,
        accessToken: response.data.accessToken,
        message: response.message,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      return rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.logout();
    clearStoredAccessToken();
    return { message: response.message };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Đăng xuất thất bại';
    return rejectWithValue(message);
  }
});

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // First attempt to get current user
      const response = await authService.getCurrentUser();
      return { user: response.data, message: response.message };
    } catch (error: unknown) {
      // Check if error is 401 (Unauthorized) - token expired
      // Error from axios interceptor has response.status
      const errorWithResponse = error as Error & {
        response?: { status?: number };
        isAxiosError?: boolean;
      };
      const isUnauthorized = errorWithResponse?.response?.status === 401;

      if (isUnauthorized) {
        try {
          // Try to refresh token
          const refreshResponse = await authService.refreshToken();
          if (refreshResponse.data?.accessToken) {
            // Update stored token
            setStoredAccessToken(refreshResponse.data.accessToken);
            // Retry getCurrentUser with new token
            try {
              const retryResponse = await authService.getCurrentUser();
              return { user: retryResponse.data, message: retryResponse.message };
            } catch (retryError: unknown) {
              // Retry failed even after refresh - clear token and reject
              clearStoredAccessToken();
              const retryErrorWithResponse = retryError as Error & {
                response?: { status?: number };
              };
              // If retry also returns 401, user is truly not authenticated
              if (retryErrorWithResponse?.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
              }
              const message =
                retryError instanceof Error
                  ? retryError.message
                  : 'Không thể lấy thông tin người dùng sau khi làm mới token';
              return rejectWithValue(message);
            }
          } else {
            // Refresh token response doesn't contain accessToken
            clearStoredAccessToken();
            return rejectWithValue('Không nhận được access token mới');
          }
        } catch (refreshError: unknown) {
          // Refresh token failed - clear token and reject
          // This means refresh token is expired or invalid - user is guest
          clearStoredAccessToken();
          const message =
            refreshError instanceof Error
              ? refreshError.message
              : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          return rejectWithValue(message);
        }
      }

      // Other errors (not 401) - reject directly
      const message = error instanceof Error ? error.message : 'Không thể lấy thông tin người dùng';
      return rejectWithValue(message);
    }
  },
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    clearAuth: state => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.hasCheckedAuth = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Register
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.hasCheckedAuth = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.hasCheckedAuth = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, state => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.hasCheckedAuth = true;
      });
  },
});

export const { clearError, setUser, setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
