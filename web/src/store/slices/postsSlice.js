import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  posts: [],
  userPosts: [],
  singlePost: null,
  isLoading: false,
  isUploading: false,
  error: null,
  hasMore: true,
  page: 1,
};

// Async thunks
export const getFeedPosts = createAsyncThunk(
  'posts/getFeed',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
      return { posts: response.data, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feed');
    }
  }
);

export const getUserPosts = createAsyncThunk(
  'posts/getUserPosts',
  async ({ userId, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
      return { posts: response.data, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

export const getSinglePost = createAsyncThunk(
  'posts/getSingle',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/like',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return { postId, likeData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      return { postId, comment: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}/comment/${commentId}`);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

// Posts slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
    resetUserPosts: (state) => {
      state.userPosts = [];
    },
    updatePostInState: (state, action) => {
      const { postId, updates } = action.payload;
      const updatePost = (posts) => {
        const index = posts.findIndex(post => post._id === postId);
        if (index !== -1) {
          posts[index] = { ...posts[index], ...updates };
        }
      };
      updatePost(state.posts);
      updatePost(state.userPosts);
      if (state.singlePost && state.singlePost._id === postId) {
        state.singlePost = { ...state.singlePost, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Feed Posts
      .addCase(getFeedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, page } = action.payload;
        if (page === 1) {
          state.posts = posts;
        } else {
          state.posts = [...state.posts, ...posts];
        }
        state.page = page;
        state.hasMore = posts.length > 0;
        state.error = null;
      })
      .addCase(getFeedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get User Posts
      .addCase(getUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, page } = action.payload;
        if (page === 1) {
          state.userPosts = posts;
        } else {
          state.userPosts = [...state.userPosts, ...posts];
        }
        state.error = null;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Single Post
      .addCase(getSinglePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSinglePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singlePost = action.payload;
        state.error = null;
      })
      .addCase(getSinglePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isUploading = false;
        state.posts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likeData } = action.payload;
        const updatePost = (posts) => {
          const index = posts.findIndex(post => post._id === postId);
          if (index !== -1) {
            posts[index].likes = likeData.likes;
          }
        };
        updatePost(state.posts);
        updatePost(state.userPosts);
        if (state.singlePost && state.singlePost._id === postId) {
          state.singlePost.likes = likeData.likes;
        }
      })
      
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const updatePost = (posts) => {
          const index = posts.findIndex(post => post._id === postId);
          if (index !== -1) {
            posts[index].comments.push(comment);
          }
        };
        updatePost(state.posts);
        updatePost(state.userPosts);
        if (state.singlePost && state.singlePost._id === postId) {
          state.singlePost.comments.push(comment);
        }
      })
      
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        const updatePost = (posts) => {
          const index = posts.findIndex(post => post._id === postId);
          if (index !== -1) {
            posts[index].comments = posts[index].comments.filter(
              comment => comment._id !== commentId
            );
          }
        };
        updatePost(state.posts);
        updatePost(state.userPosts);
        if (state.singlePost && state.singlePost._id === postId) {
          state.singlePost.comments = state.singlePost.comments.filter(
            comment => comment._id !== commentId
          );
        }
      })
      
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const updatePost = (posts) => {
          const index = posts.findIndex(post => post._id === updatedPost._id);
          if (index !== -1) {
            posts[index] = updatedPost;
          }
        };
        updatePost(state.posts);
        updatePost(state.userPosts);
        if (state.singlePost && state.singlePost._id === updatedPost._id) {
          state.singlePost = updatedPost;
        }
      })
      
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.filter(post => post._id !== postId);
        state.userPosts = state.userPosts.filter(post => post._id !== postId);
        if (state.singlePost && state.singlePost._id === postId) {
          state.singlePost = null;
        }
      });
  },
});

export const { clearError, resetPosts, resetUserPosts, updatePostInState } = postsSlice.actions;

// Selectors
export const selectPosts = (state) => state.posts.posts;
export const selectUserPosts = (state) => state.posts.userPosts;
export const selectSinglePost = (state) => state.posts.singlePost;
export const selectPostsLoading = (state) => state.posts.isLoading;
export const selectUploadLoading = (state) => state.posts.isUploading;
export const selectPostsError = (state) => state.posts.error;
export const selectHasMorePosts = (state) => state.posts.hasMore;
export const selectCurrentPage = (state) => state.posts.page;

export default postsSlice.reducer;