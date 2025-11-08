import authReducer, { setAccessToken as syncAccessToken } from './auth/auth.slice';
import usersReducer from './users/users.slice';
import wishlistReducer from './wishlist/wishlist.slice';
import { subscribeAccessToken } from '@/services/token-manager';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    wishlist: wishlistReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/getCurrentUser/fulfilled', 'auth/loginUser/fulfilled'],
      },
    }),
});

subscribeAccessToken(token => {
  store.dispatch(syncAccessToken(token));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
