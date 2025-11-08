import { changePassword, getUserById, updateUser } from '@/services';
import type { ChangePasswordRequest, UpdateUserRequest, User, UsersState } from '@/types';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: UsersState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunks for user operations
export const updateUserProfile = createAsyncThunk(
  'users/updateProfile',
  async (request: UpdateUserRequest, { rejectWithValue }) => {
    try {
      const response = await updateUser(request);
      return { user: response.data, message: response.message };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Cập nhật thông tin thất bại';
      return rejectWithValue(message);
    }
  },
);

export const changeUserPassword = createAsyncThunk(
  'users/changePassword',
  async (request: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await changePassword(request);
      return { message: response.message };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Đổi mật khẩu thất bại';
      return rejectWithValue(message);
    }
  },
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getUserById(id);
      return { user: response.data, message: response.message };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Không thể lấy thông tin người dùng';
      return rejectWithValue(message);
    }
  },
);

// Users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearUsersState: state => {
      state.currentUser = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Update profile
    builder
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changeUserPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentUser, clearUsersState } = usersSlice.actions;
export default usersSlice.reducer;
