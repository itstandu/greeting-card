import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { wishlistStorage } from '@/lib/store/wishlist/wishlist-storage';
import {
  addWishlistItem,
  fetchWishlist,
  optimisticAdd,
  optimisticRemove,
  removeWishlistItemAsync,
  resetWishlist,
} from '@/lib/store/wishlist/wishlist.slice';

// Global flag to prevent duplicate fetches across component instances
let globalHasFetched = false;

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const { productIds, isLoading, hasFetched, error } = useAppSelector(state => state.wishlist);
  const fetchAttemptedRef = useRef(false);

  // Fetch wishlist once when user is authenticated
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      !hasFetched &&
      !isLoading &&
      !fetchAttemptedRef.current &&
      !globalHasFetched
    ) {
      fetchAttemptedRef.current = true;
      globalHasFetched = true;
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, user, hasFetched, isLoading]);

  // Reset wishlist when user logs out
  useEffect(() => {
    if (!isAuthenticated && hasFetched) {
      dispatch(resetWishlist());
      fetchAttemptedRef.current = false;
      globalHasFetched = false;
    }
  }, [dispatch, isAuthenticated, hasFetched]);

  // Check if product is in wishlist (array includes lookup)
  const isInWishlist = useCallback(
    (productId: number): boolean => {
      if (isAuthenticated && user) {
        return productIds.includes(productId);
      }
      // For guests, check localStorage
      return wishlistStorage.hasItem(productId);
    },
    [isAuthenticated, user, productIds],
  );

  // Add to wishlist with optimistic update
  const addToWishlist = useCallback(
    async (productId: number) => {
      if (isAuthenticated && user) {
        // Optimistic update
        dispatch(optimisticAdd(productId));
        try {
          await dispatch(addWishlistItem(productId)).unwrap();
        } catch (error) {
          // Rollback on failure
          dispatch(optimisticRemove(productId));
          throw error;
        }
      }
    },
    [dispatch, isAuthenticated, user],
  );

  // Remove from wishlist with optimistic update
  const removeFromWishlist = useCallback(
    async (productId: number) => {
      if (isAuthenticated && user) {
        // Optimistic update
        dispatch(optimisticRemove(productId));
        try {
          await dispatch(removeWishlistItemAsync(productId)).unwrap();
        } catch (error) {
          // Rollback on failure
          dispatch(optimisticAdd(productId));
          throw error;
        }
      }
    },
    [dispatch, isAuthenticated, user],
  );

  // Refetch wishlist (e.g., after sync)
  const refetch = useCallback(() => {
    if (isAuthenticated && user) {
      globalHasFetched = false;
      fetchAttemptedRef.current = false;
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, user]);

  return {
    productIds,
    isLoading,
    hasFetched,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refetch,
  };
};
