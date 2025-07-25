import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createPost } from '../../store/slices/postsSlice';
import { selectUser } from '../../store/slices/authSlice';

const CreatePost = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + mediaFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB

      if (!isImage && !isVideo) {
        toast.error('Only images and videos are allowed');
        return false;
      }

      if (!isValidSize) {
        toast.error('File size must be less than 100MB');
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setMediaFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(prev => [...prev, {
          file,
          url: e.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      
      mediaFiles.forEach((file, index) => {
        formData.append('media', file);
      });

      const result = await dispatch(createPost(formData));
      
      if (result.type === 'posts/create/fulfilled') {
        toast.success('Post created successfully!');
        setContent('');
        setMediaFiles([]);
        setMediaPreview([]);
        setIsExpanded(false);
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      toast.error('Error creating post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {user?.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's on your mind?"
              className="w-full resize-none border-none outline-none text-lg placeholder-gray-500 bg-transparent"
              rows={isExpanded ? 4 : 1}
            />

            {/* Media Preview */}
            <AnimatePresence>
              {mediaPreview.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mediaPreview.map((media, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt=""
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={media.url}
                            className="w-full h-32 object-cover rounded-lg"
                            controls={false}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4"
                >
                  <div className="flex items-center space-x-4">
                    {/* Photo/Video Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Photo/Video</span>
                    </button>

                    {/* Emoji */}
                    <button
                      type="button"
                      className="flex items-center space-x-2 text-yellow-600 hover:bg-yellow-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Feeling</span>
                    </button>

                    {/* Location */}
                    <button
                      type="button"
                      className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden sm:inline">Location</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent('');
                        setMediaFiles([]);
                        setMediaPreview([]);
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isUploading || (!content.trim() && mediaFiles.length === 0)}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
                    >
                      {isUploading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Posting...</span>
                        </div>
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePost;