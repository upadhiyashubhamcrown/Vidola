import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { likePost, addComment } from '../../store/slices/postsSlice';
import { selectUser } from '../../store/slices/authSlice';

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  
  const isLiked = post.likes?.includes(currentUser?._id);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  const handleLike = async () => {
    try {
      await dispatch(likePost(post._id));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsCommenting(true);
    try {
      const result = await dispatch(addComment({
        postId: post._id,
        content: commentText.trim()
      }));
      
      if (result.type === 'posts/addComment/fulfilled') {
        setCommentText('');
        toast.success('Comment added!');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author.username}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <Link to={`/profile/${post.author.username}`} className="flex-shrink-0">
          <div className="relative">
            {post.author.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt={post.author.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {post.author.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {post.author.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link 
            to={`/profile/${post.author.username}`}
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center space-x-1"
          >
            <span>{post.author.fullName}</span>
            {post.author.isVerified && (
              <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </Link>
          <p className="text-sm text-gray-500">
            @{post.author.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Options Menu */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 text-lg leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="relative">
          {post.media.length === 1 ? (
            <div className="w-full">
              {post.media[0].type === 'image' ? (
                <img
                  src={post.media[0].url}
                  alt=""
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <video
                  src={post.media[0].url}
                  controls
                  className="w-full max-h-96"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.media.slice(0, 4).map((media, index) => (
                <div key={index} className="relative">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {index === 3 && post.media.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        +{post.media.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {likesCount > 0 && (
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
          )}
          {commentsCount > 0 && (
            <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="hidden sm:inline">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100"
        >
          {/* Add Comment */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleComment} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {currentUser?.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">
                      {currentUser?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {commentText.trim() && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isCommenting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-4 py-1 rounded-lg text-sm transition-colors"
                    >
                      {isCommenting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="max-h-64 overflow-y-auto">
            {post.comments?.map((comment, index) => (
              <div key={comment._id || index} className="p-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {comment.author?.profilePicture ? (
                    <img
                      src={comment.author.profilePicture}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm">
                        {comment.author?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.author?.fullName || comment.author?.username}
                      </span>
                      {comment.author?.isVerified && (
                        <div className="w-3 h-3 bg-black rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{formatDistanceToNow(new Date(comment.createdAt || Date.now()), { addSuffix: true })}</span>
                    <button className="hover:text-gray-700">Like</button>
                    <button className="hover:text-gray-700">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PostCard;