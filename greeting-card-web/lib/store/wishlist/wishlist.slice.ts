import { addToWishlist, getWishlist, removeWishlistItem } from '@/services/wishlist.service';
import { WishlistResponse } from '@/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  // Array of product IDs in wishlist (serializable, use includes() for lookup)
  productIds: number[];
  // Full wishlist data (optional, for displaying items)
  wishlistData: WishlistResponse | null;
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  productIds: [],
  wishlistData: null,
  isLoading: false,
  hasFetched: false,
  error: null,
};

// Async thunk to fetch wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWishlist();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist');
    }
  },
);

// Async thunk to add item to wishlist
export const addWishlistItem = createAsyncThunk(
  'wishlist/addItem',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await addToWishlist({ productId });
      return { productId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to wishlist');
    }
  },
);

// Async thunk to remove item from wishlist
export const removeWishlistItemAsync = createAsyncThunk(
  'wishlist/removeItem',
  async (productId: number, { rejectWithValue }) => {
    try {
      await removeWishlistItem(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from wishlist');
    }
  },
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Reset wishlist state (e.g., on logout)
    resetWishlist: state => {
      state.productIds = [];
      state.wishlistData = null;
      state.hasFetched = false;
      state.error = null;
    },
    // Optimistic add (before API call completes)
    optimisticAdd: (state, action: PayloadAction<number>) => {
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload);
      }
    },
    // Optimistic remove (before API call completes)
    optimisticRemove: (state, action: PayloadAction<number>) => {
      state.productIds = state.productIds.filter(id => id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasFetched = true;
        state.wishlistData = action.payload;
        // Extract product IDs from wishlist items
        state.productIds = action.payload?.items?.map(item => item.product.id) || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.hasFetched = true;
        state.error = action.payload as string;
      })
      // Add item
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        if (!state.productIds.includes(action.payload.productId)) {
          state.productIds.push(action.payload.productId);
        }
        state.wishlistData = action.payload.data;
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        // Rollback optimistic update if needed
        state.error = action.payload as string;
      })
      // Remove item
      .addCase(removeWishlistItemAsync.fulfilled, (state, action) => {
        state.productIds = state.productIds.filter(id => id !== action.payload);
        // Update wishlist data
        if (state.wishlistData) {
          state.wishlistData = {
            ...state.wishlistData,
            items: state.wishlistData.items.filter(item => item.product.id !== action.payload),
            totalItems: state.wishlistData.totalItems - 1,
          };
        }
      })
      .addCase(removeWishlistItemAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { resetWishlist, optimisticAdd, optimisticRemove } = wishlistSlice.actions;
export default wishlistSlice.reducer;
