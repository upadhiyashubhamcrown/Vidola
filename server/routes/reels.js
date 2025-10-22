const express = require('express');
const Reel = require('../models/Reel');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new reel
router.post('/', auth, async (req, res) => {
  try {
    const { video, caption, audio, tags } = req.body;

    if (!video || !video.url) {
      return res.status(400).json({ message: 'Video is required' });
    }

    const reel = new Reel({
      user: req.user._id,
      video,
      caption,
      audio,
      tags: tags || []
    });

    await reel.save();

    // Add reel to user's reels array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { reels: reel._id }
    });

    // Populate user data
    await reel.populate('user', 'username fullName profilePicture isVerified');

    res.status(201).json(reel);
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reels feed (discovery/explore)
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get reels with some randomization for discovery
    const reels = await Reel.aggregate([
      { $match: { isArchived: false } },
      { $sample: { size: limit * 2 } }, // Get more for randomization
      { $sort: { views: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Populate user data
    await Reel.populate(reels, [
      {
        path: 'user',
        select: 'username fullName profilePicture isVerified'
      },
      {
        path: 'likes.user',
        select: 'username fullName profilePicture'
      },
      {
        path: 'comments.user',
        select: 'username fullName profilePicture'
      }
    ]);

    res.json(reels);
  } catch (error) {
    console.error('Get reels feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reels by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({
      user: userId,
      isArchived: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName profilePicture isVerified');

    res.json(reels);
  } catch (error) {
    console.error('Get user reels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single reel
router.get('/:id', async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('user', 'username fullName profilePicture isVerified')
      .populate('likes.user', 'username fullName profilePicture')
      .populate('comments.user', 'username fullName profilePicture');

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Increment view count
    reel.views += 1;
    await reel.save();

    res.json(reel);
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike reel
router.post('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const existingLike = reel.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      reel.likes = reel.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      reel.likes.push({ user: req.user._id });
    }

    await reel.save();
    await reel.populate('likes.user', 'username fullName profilePicture');

    res.json({
      likes: reel.likes,
      likesCount: reel.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Like reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to reel
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const comment = {
      user: req.user._id,
      text: text.trim()
    };

    reel.comments.push(comment);
    await reel.save();

    await reel.populate('comments.user', 'username fullName profilePicture');

    const newComment = reel.comments[reel.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment from reel
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    
    const reel = await Reel.findById(id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const comment = reel.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or the reel
    if (comment.user.toString() !== req.user._id.toString() && 
        reel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reel.comments.pull(commentId);
    await reel.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share reel
router.post('/:id/share', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Check if user already shared this reel
    const existingShare = reel.shares.find(
      share => share.user.toString() === req.user._id.toString()
    );

    if (!existingShare) {
      reel.shares.push({ user: req.user._id });
      await reel.save();
    }

    res.json({ 
      message: 'Reel shared',
      sharesCount: reel.shares.length 
    });
  } catch (error) {
    console.error('Share reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update reel
router.put('/:id', auth, async (req, res) => {
  try {
    const { caption, tags } = req.body;
    
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reel.caption = caption !== undefined ? caption : reel.caption;
    reel.tags = tags !== undefined ? tags : reel.tags;

    await reel.save();
    await reel.populate('user', 'username fullName profilePicture isVerified');

    res.json(reel);
  } catch (error) {
    console.error('Update reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reel
router.delete('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Reel.findByIdAndDelete(req.params.id);
    
    // Remove reel from user's reels array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { reels: req.params.id }
    });

    res.json({ message: 'Reel deleted' });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;