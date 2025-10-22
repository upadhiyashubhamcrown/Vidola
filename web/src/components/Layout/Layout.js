import React from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { selectIsVerified } from '../../store/slices/authSlice';

const Layout = ({ children }) => {
  const isVerified = useSelector(selectIsVerified);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 ml-8">
          <Sidebar />
        </aside>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Black Tick Notification */}
      {!isVerified && (
        <div className="fixed bottom-20 right-4 z-40 lg:hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <div className="text-sm font-semibold">Get Verified</div>
                <div className="text-xs text-gray-300">₹99/month</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;