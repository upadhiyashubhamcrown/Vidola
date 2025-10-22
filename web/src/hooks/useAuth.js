import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser, selectIsAuthenticated, selectIsLoading, selectUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);

  useEffect(() => {
    const token = localStorage.getItem('openbaux_token');
    if (token && !user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  return {
    isAuthenticated,
    isLoading,
    user,
  };
};