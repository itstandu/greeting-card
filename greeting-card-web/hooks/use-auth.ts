import { useEffect, useRef } from 'react';
import { getCurrentUser, logoutUser } from '@/lib/store/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Global flag to track if getCurrentUser has been called - ensures only one request is made even if multiple components use useAuth
let globalHasAttempted = false;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, hasCheckedAuth, error } = useAppSelector(
    state => state.auth,
  );
  const hasAttemptedRef = useRef(false);

  // Always attempt to get current user on mount if not authenticated - allows checking auth status even after page reload. getCurrentUser thunk handles refresh token logic
  useEffect(() => {
    // Only call if:
    // 1. We haven't attempted yet (both local and global)
    // 2. User is not authenticated
    // 3. Not currently loading
    if (!hasAttemptedRef.current && !globalHasAttempted && !isAuthenticated && !isLoading) {
      hasAttemptedRef.current = true;
      globalHasAttempted = true;
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  // Reset attempt flags when user becomes authenticated (allows retry after logout/login)
  useEffect(() => {
    if (isAuthenticated) {
      hasAttemptedRef.current = false;
      globalHasAttempted = false;
    }
  }, [isAuthenticated]);

  const logout = async () => {
    await dispatch(logoutUser());
    hasAttemptedRef.current = false;
    globalHasAttempted = false;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    hasCheckedAuth,
    error,
    logout,
  };
};
