import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  stories: [],
  userStories: [],
  currentStory: null,
  isLoading: false,
  isUploading: false,
  error: null,
};

export const getStoriesFeed = createAsyncThunk(
  'stories/getFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/stories/feed');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stories');
    }
  }
);

export const getUserStories = createAsyncThunk(
  'stories/getUserStories',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stories/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user stories');
    }
  }
);

export const createStory = createAsyncThunk(
  'stories/create',
  async (storyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/stories', storyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create story');
    }
  }
);

export const viewStory = createAsyncThunk(
  'stories/view',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/stories/${storyId}/view`);
      return { storyId, views: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to view story');
    }
  }
);

export const deleteStory = createAsyncThunk(
  'stories/delete',
  async (storyId, { rejectWithValue }) => {
    try {
      await api.delete(`/stories/${storyId}`);
      return storyId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete story');
    }
  }
);

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStory: (state, action) => {
      state.currentStory = action.payload;
    },
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStoriesFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStoriesFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stories = action.payload;
        state.error = null;
      })
      .addCase(getStoriesFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createStory.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.isUploading = false;
        state.userStories.push(action.payload);
        state.error = null;
      })
      .addCase(createStory.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentStory, clearCurrentStory } = storiesSlice.actions;
export default storiesSlice.reducer;