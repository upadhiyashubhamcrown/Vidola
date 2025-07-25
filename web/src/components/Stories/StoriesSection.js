import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectUser } from '../../store/slices/authSlice';

const StoriesSection = ({ stories = [] }) => {
  const currentUser = useSelector(selectUser);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {/* Add Your Story */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-shrink-0"
        >
          <button className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden group hover:scale-105 transition-transform">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-lg">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-colors flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
          <p className="text-xs text-center mt-2 text-gray-600 font-medium">Your story</p>
        </motion.div>

        {/* Stories from followed users */}
        {stories.map((story, index) => (
          <motion.div
            key={story._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0"
          >
            <button className="relative w-16 h-16 rounded-full overflow-hidden group hover:scale-105 transition-transform">
              {/* Story Ring */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 rounded-full p-0.5">
                <div className="w-full h-full bg-white rounded-full p-0.5">
                  {story.author?.profilePicture ? (
                    <img
                      src={story.author.profilePicture}
                      alt={story.author.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {story.author?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Verified Badge */}
              {story.author?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
            <p className="text-xs text-center mt-2 text-gray-600 font-medium truncate w-16">
              {story.author?.username}
            </p>
          </motion.div>
        ))}

        {/* Placeholder stories for demo */}
        {stories.length === 0 && (
          <>
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 rounded-full p-0.5">
                    <div className="w-full h-full bg-white rounded-full p-0.5">
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 font-medium text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-gray-400 font-medium">
                  user{index + 1}
                </p>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default StoriesSection;