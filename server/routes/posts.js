const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    const { caption, media, tags, location } = req.body;

    if (!media || media.length === 0) {
      return res.status(400).json({ message: 'At least one media file is required' });
    }

    const post = new Post({
      user: req.user._id,
      caption,
      media,
      tags: tags || [],
      location
    });

    await post.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id }
    });

    // Populate user data
    await post.populate('user', 'username fullName profilePicture isVerified');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feed posts (posts from following users)
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const followingIds = user.following.concat(req.user._id); // Include own posts

    const posts = await Post.find({
      user: { $in: followingIds },
      isArchived: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName profilePicture isVerified')
      .populate('likes.user', 'username fullName profilePicture')
      .populate('comments.user', 'username fullName profilePicture');

    res.json(posts);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      user: userId,
      isArchived: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName profilePicture isVerified');

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username fullName profilePicture isVerified')
      .populate('likes.user', 'username fullName profilePicture')
      .populate('comments.user', 'username fullName profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();
    await post.populate('likes.user', 'username fullName profilePicture');

    res.json({
      likes: post.likes,
      likesCount: post.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.user', 'username fullName profilePicture');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or the post
    if (comment.user.toString() !== req.user._id.toString() && 
        post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.comments.pull(commentId);
    await post.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const { caption, tags, location } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.caption = caption !== undefined ? caption : post.caption;
    post.tags = tags !== undefined ? tags : post.tags;
    post.location = location !== undefined ? location : post.location;

    await post.save();
    await post.populate('user', 'username fullName profilePicture isVerified');

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: req.params.id }
    });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;