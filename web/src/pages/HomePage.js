import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getFeedPosts, selectFeedPosts, selectFeedLoading } from '../store/slices/postsSlice';
import { getStoriesFeed, selectStoriesFeed } from '../store/slices/storiesSlice';
import CreatePost from '../components/Posts/CreatePost';
import PostCard from '../components/Posts/PostCard';
import StoriesSection from '../components/Stories/StoriesSection';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const HomePage = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  
  const posts = useSelector(selectFeedPosts);
  const isLoading = useSelector(selectFeedLoading);
  const stories = useSelector(selectStoriesFeed);

  useEffect(() => {
    dispatch(getFeedPosts(page));
    dispatch(getStoriesFeed());
  }, [dispatch, page]);

  const loadMorePosts = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Stories Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <StoriesSection stories={stories} />
      </motion.div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <CreatePost />
      </motion.div>

      {/* Posts Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}

        {/* Load More Button */}
        {posts.length > 0 && !isLoading && (
          <div className="text-center py-8">
            <button
              onClick={loadMorePosts}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-6 8l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Start following users or create your first post to see content here.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Find People to Follow
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                Create Your First Post
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HomePage;