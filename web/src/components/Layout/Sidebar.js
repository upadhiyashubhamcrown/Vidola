import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  getSuggestedUsers, 
  followUser,
  selectSuggestedUsers,
  selectUsersLoading 
} from '../../store/slices/usersSlice';
import { selectIsVerified } from '../../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const suggestedUsers = useSelector(selectSuggestedUsers);
  const isLoading = useSelector(selectUsersLoading);
  const isVerified = useSelector(selectIsVerified);

  useEffect(() => {
    dispatch(getSuggestedUsers());
  }, [dispatch]);

  const handleFollow = async (userId) => {
    try {
      await dispatch(followUser(userId));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Black Tick Promotion */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">✓</span>
            </div>
            <h3 className="font-bold text-lg">Get Verified</h3>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            Join the exclusive verified community with the prestigious Black Tick badge.
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm">
              <span className="text-green-400 mr-2">✓</span>
              <span>Exclusive Black Tick badge</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-400 mr-2">✓</span>
              <span>Ad-free experience</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-400 mr-2">✓</span>
              <span>Priority support</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-400 mr-2">✓</span>
              <span>Advanced analytics</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <div className="font-bold text-lg">₹99</div>
              <div className="text-xs text-gray-300">per month</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">₹999</div>
              <div className="text-xs text-gray-300">per year</div>
              <div className="text-yellow-400 text-xs">Save ₹189!</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Black Tick
          </button>
        </motion.div>
      )}

      {/* Suggested Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="font-bold text-lg text-gray-900 mb-4">Suggested for you</h3>
        
        <div className="space-y-4">
          {!isLoading && suggestedUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <Link to={`/profile/${user.username}`} className="flex-shrink-0">
                <div className="relative">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/profile/${user.username}`}
                  className="block"
                >
                  <div className="font-semibold text-gray-900 text-sm truncate flex items-center space-x-1">
                    <span>{user.fullName}</span>
                    {user.isVerified && (
                      <div className="w-3 h-3 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs truncate">@{user.username}</p>
                  <p className="text-gray-400 text-xs">
                    {user.followersCount || 0} followers
                  </p>
                </Link>
              </div>
              
              <button
                onClick={() => handleFollow(user._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Follow
              </button>
            </motion.div>
          ))}

          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/search')}
          className="w-full mt-4 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        >
          See all suggestions
        </button>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="font-bold text-lg text-gray-900 mb-4">Trending on Openbaux</h3>
        
        <div className="space-y-3">
          {[
            { tag: '#OpenbuxLife', posts: '12.3K posts' },
            { tag: '#BlackTickVerified', posts: '8.7K posts' },
            { tag: '#TechTalks', posts: '5.4K posts' },
            { tag: '#CreatorEconomy', posts: '3.2K posts' },
            { tag: '#SocialMedia2024', posts: '2.8K posts' }
          ].map((trend, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="font-semibold text-gray-900 text-sm">{trend.tag}</div>
              <div className="text-gray-500 text-xs">{trend.posts}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-gray-500 space-y-2"
      >
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/about" className="hover:text-gray-700">About</Link>
          <span>•</span>
          <Link to="/help" className="hover:text-gray-700">Help</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-gray-700">Terms</Link>
        </div>
        <div>
          © 2024 Openbaux. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;