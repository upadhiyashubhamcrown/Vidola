import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsVerified } from '../../store/slices/authSlice';
import { selectUnreadCount } from '../../store/slices/notificationsSlice';

const MobileNavigation = () => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const isVerified = useSelector(selectIsVerified);
  const unreadCount = useSelector(selectUnreadCount);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home'
    },
    {
      path: '/search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: 'Search'
    },
    {
      path: '/reels',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Reels'
    },
    {
      path: '/notifications',
      icon: (
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM7 7h5v5H7V7zm8 0h5v5h-5V7z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      ),
      label: 'Activity'
    },
    {
      path: `/profile/${user?.username}`,
      icon: (
        <div className="relative">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xs font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
      ),
      label: 'Profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className={`transition-transform ${isActive(item.path) ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;