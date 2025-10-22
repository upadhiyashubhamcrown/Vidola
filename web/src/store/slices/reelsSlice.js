import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  reels: [],
  userReels: [],
  currentReel: null,
  isLoading: false,
  isUploading: false,
  error: null,
  hasMore: true,
  page: 1,
};

export const getReelsFeed = createAsyncThunk(
  'reels/getFeed',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reels/feed?page=${page}&limit=${limit}`);
      return { reels: response.data, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reels');
    }
  }
);

export const getUserReels = createAsyncThunk(
  'reels/getUserReels',
  async ({ userId, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reels/user/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reels');
    }
  }
);

export const createReel = createAsyncThunk(
  'reels/create',
  async (reelData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reels', reelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reel');
    }
  }
);

export const likeReel = createAsyncThunk(
  'reels/like',
  async (reelId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reels/${reelId}/like`);
      return { reelId, likeData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like reel');
    }
  }
);

export const shareReel = createAsyncThunk(
  'reels/share',
  async (reelId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reels/${reelId}/share`);
      return { reelId, shareData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share reel');
    }
  }
);

export const addReelComment = createAsyncThunk(
  'reels/addComment',
  async ({ reelId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reels/${reelId}/comment`, { text });
      return { reelId, comment: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const reelsSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetReels: (state) => {
      state.reels = [];
      state.page = 1;
      state.hasMore = true;
    },
    setCurrentReel: (state, action) => {
      state.currentReel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReelsFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReelsFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        const { reels, page } = action.payload;
        if (page === 1) {
          state.reels = reels;
        } else {
          state.reels = [...state.reels, ...reels];
        }
        state.page = page;
        state.hasMore = reels.length > 0;
        state.error = null;
      })
      .addCase(getReelsFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createReel.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(createReel.fulfilled, (state, action) => {
        state.isUploading = false;
        state.reels.unshift(action.payload);
        state.error = null;
      })
      .addCase(createReel.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      .addCase(likeReel.fulfilled, (state, action) => {
        const { reelId, likeData } = action.payload;
        const reel = state.reels.find(r => r._id === reelId);
        if (reel) {
          reel.likes = likeData.likes;
        }
      });
  },
});

export const { clearError, resetReels, setCurrentReel } = reelsSlice.actions;
export default reelsSlice.reducer;