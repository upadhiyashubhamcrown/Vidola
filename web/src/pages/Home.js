import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getFeedPosts, likePost, addComment } from '../store/slices/postsSlice';
import { getStoriesFeed } from '../store/slices/storiesSlice';
import { getSuggestedUsers } from '../store/slices/usersSlice';
import { getCurrentSubscription } from '../store/slices/subscriptionSlice';
import Layout from '../components/Layout/Layout';
import StoriesBar from '../components/Stories/StoriesBar';
import PostCard from '../components/Posts/PostCard';
import CreatePost from '../components/Posts/CreatePost';
import SuggestedUsers from '../components/Users/SuggestedUsers';
import BlackTickPromo from '../components/Subscription/BlackTickPromo';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, hasMore, error } = useSelector((state) => state.posts);
  const { stories } = useSelector((state) => state.stories);
  const { suggestedUsers } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const { currentSubscription } = useSelector((state) => state.subscription);
  
  const [page, setPage] = useState(1);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    dispatch(getFeedPosts({ page: 1 }));
    dispatch(getStoriesFeed());
    dispatch(getSuggestedUsers());
    if (user) {
      dispatch(getCurrentSubscription());
    }
  }, [dispatch, user]);

  const fetchMorePosts = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      dispatch(getFeedPosts({ page: nextPage }));
      setPage(nextPage);
    }
  };

  const handleLike = (postId) => {
    dispatch(likePost(postId));
  };

  const handleComment = (postId, content) => {
    dispatch(addComment({ postId, content }));
  };

  if (isLoading && posts.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-3">
              {/* Stories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <StoriesBar stories={stories} />
              </motion.div>

              {/* Create Post */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <CreatePost 
                  onPostCreated={() => dispatch(getFeedPosts({ page: 1 }))} 
                  showModal={showCreatePost}
                  setShowModal={setShowCreatePost}
                />
              </motion.div>

              {/* Posts Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <InfiniteScroll
                  dataLength={posts.length}
                  next={fetchMorePosts}
                  hasMore={hasMore}
                  loader={
                    <div className="flex justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  }
                  endMessage={
                    <div className="text-center py-8 text-gray-500">
                      <p>You've seen all posts! 🎉</p>
                      <p className="text-sm mt-2">Follow more users to see more content</p>
                    </div>
                  }
                >
                  {posts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-6"
                    >
                      <PostCard
                        post={post}
                        onLike={handleLike}
                        onComment={handleComment}
                      />
                    </motion.div>
                  ))}
                </InfiniteScroll>

                {posts.length === 0 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Welcome to Openbaux! 
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start following users to see their posts in your feed
                      </p>
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Your First Post
                      </button>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">Error loading posts: {error}</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Black Tick Promotion - Show only if user doesn't have active subscription */}
                {(!currentSubscription || currentSubscription.status !== 'active') && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <BlackTickPromo />
                  </motion.div>
                )}

                {/* Suggested Users */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <SuggestedUsers users={suggestedUsers} />
                </motion.div>

                {/* App Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">About Openbaux</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Share moments with friends</p>
                    <p>• Create engaging stories</p>
                    <p>• Make viral reels</p>
                    <p>• Get verified with Black Tick</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      © 2024 Openbaux. All rights reserved.
                    </p>
                  </div>
                </motion.div>

                {/* Quick Stats */}
                {user?.isVerified && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="font-semibold">Verified Member</span>
                    </div>
                    <p className="text-sm opacity-90">
                      You're part of the exclusive Black Tick community!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;