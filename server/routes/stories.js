const express = require('express');
const Story = require('../models/Story');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new story
router.post('/', auth, async (req, res) => {
  try {
    const { media, text, backgroundColor } = req.body;

    if (!media && !text) {
      return res.status(400).json({ message: 'Either media or text is required' });
    }

    const story = new Story({
      user: req.user._id,
      media,
      text,
      backgroundColor
    });

    await story.save();

    // Add story to user's stories array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { stories: story._id }
    });

    // Populate user data
    await story.populate('user', 'username fullName profilePicture isVerified');

    res.status(201).json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stories from following users
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followingIds = user.following.concat(req.user._id); // Include own stories

    // Group stories by user
    const stories = await Story.aggregate([
      {
        $match: {
          user: { $in: followingIds },
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$user',
          stories: { $push: '$$ROOT' },
          latestStory: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'latestStory.createdAt': -1 }
      }
    ]);

    // Populate user data
    await Story.populate(stories, {
      path: '_id',
      select: 'username fullName profilePicture isVerified'
    });

    res.json(stories);
  } catch (error) {
    console.error('Get stories feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stories by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const stories = await Story.find({
      user: userId,
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName profilePicture isVerified')
      .populate('views.user', 'username fullName profilePicture');

    res.json(stories);
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single story
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('user', 'username fullName profilePicture isVerified')
      .populate('views.user', 'username fullName profilePicture');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json(story);
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark story as viewed
router.post('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user already viewed this story
    const existingView = story.views.find(
      view => view.user.toString() === req.user._id.toString()
    );

    if (!existingView) {
      story.views.push({ user: req.user._id });
      await story.save();
    }

    res.json({ message: 'Story viewed', viewsCount: story.views.length });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get story views (only for story owner)
router.get('/:id/views', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('views.user', 'username fullName profilePicture');
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user owns the story
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      views: story.views,
      viewsCount: story.views.length
    });
  } catch (error) {
    console.error('Get story views error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Story.findByIdAndDelete(req.params.id);
    
    // Remove story from user's stories array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { stories: req.params.id }
    });

    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;