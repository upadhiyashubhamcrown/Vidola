import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  plans: null,
  currentSubscription: null,
  isLoading: false,
  error: null,
  paymentLoading: false,
};

// Async thunks
export const getSubscriptionPlans = createAsyncThunk(
  'subscription/getPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/subscription/plans');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const createSubscriptionOrder = createAsyncThunk(
  'subscription/createOrder',
  async (plan, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscription/create-order', { plan });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'subscription/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscription/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

export const getCurrentSubscription = createAsyncThunk(
  'subscription/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/subscription/current');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscription/cancel');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

// Subscription slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPaymentLoading: (state, action) => {
      state.paymentLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Plans
      .addCase(getSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
        state.error = null;
      })
      .addCase(getSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Order
      .addCase(createSubscriptionOrder.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(createSubscriptionOrder.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.error = null;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })
      
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentSubscription = action.payload.subscription;
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })
      
      // Get Current Subscription
      .addCase(getCurrentSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload;
        state.error = null;
      })
      .addCase(getCurrentSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentSubscription) {
          state.currentSubscription.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setPaymentLoading } = subscriptionSlice.actions;

// Selectors
export const selectSubscription = (state) => state.subscription;
export const selectPlans = (state) => state.subscription.plans;
export const selectCurrentSubscription = (state) => state.subscription.currentSubscription;
export const selectSubscriptionLoading = (state) => state.subscription.isLoading;
export const selectPaymentLoading = (state) => state.subscription.paymentLoading;
export const selectSubscriptionError = (state) => state.subscription.error;

export default subscriptionSlice.reducer;