import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import postsSlice from './slices/postsSlice';
import storiesSlice from './slices/storiesSlice';
import reelsSlice from './slices/reelsSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import notificationsSlice from './slices/notificationsSlice';
import usersSlice from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postsSlice,
    stories: storiesSlice,
    reels: reelsSlice,
    subscription: subscriptionSlice,
    notifications: notificationsSlice,
    users: usersSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;