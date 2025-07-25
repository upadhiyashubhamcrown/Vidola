import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getReelsFeed } from '../store/slices/reelsSlice';

const ReelsPage = () => {
  const dispatch = useDispatch();
  const reels = useSelector((state) => state.reels?.feedReels || []);
  const isLoading = useSelector((state) => state.reels?.isLoading || false);

  useEffect(() => {
    dispatch(getReelsFeed());
  }, [dispatch]);

  return (
    <div className="max-w-md mx-auto bg-black min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md p-4">
        <h1 className="text-white text-xl font-bold text-center">Reels</h1>
      </div>

      {/* Reels Feed */}
      <div className="space-y-0">
        {reels.map((reel, index) => (
          <motion.div
            key={reel._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative h-screen w-full bg-black"
          >
            {/* Video */}
            <video
              src={reel.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />

            {/* Overlay Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              {/* Right Actions */}
              <div className="absolute right-4 bottom-20 space-y-6">
                {/* Author Profile */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {reel.author?.profilePicture ? (
                      <img
                        src={reel.author.profilePicture}
                        alt={reel.author.username}
                        className="w-12 h-12 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {reel.author?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {reel.author?.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-white">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Like */}
                <button className="flex flex-col items-center text-white">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-xs">{reel.likesCount || 0}</span>
                </button>

                {/* Comment */}
                <button className="flex flex-col items-center text-white">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs">{reel.commentsCount || 0}</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center text-white">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-xs">{reel.sharesCount || 0}</span>
                </button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-4 left-4 right-20 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold">@{reel.author?.username}</span>
                  {reel.author?.isVerified && (
                    <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                {reel.caption && (
                  <p className="text-sm mb-2 line-clamp-2">{reel.caption}</p>
                )}
                {reel.music && (
                  <div className="flex items-center space-x-2 text-xs opacity-80">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    <span>{reel.music}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {!isLoading && reels.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex items-center justify-center text-white text-center"
          >
            <div>
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No reels yet</h3>
              <p className="text-gray-400 mb-6">
                Start following creators or create your first reel
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Create Reel
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsPage;