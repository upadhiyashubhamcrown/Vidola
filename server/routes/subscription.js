const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Subscription plans
const PLANS = {
  monthly: {
    price: 99,
    duration: 30,
    name: 'Openbaux Black Tick - Monthly',
    description: 'Get verified with the prestigious Black Tick for 30 days'
  },
  yearly: {
    price: 999,
    duration: 365,
    name: 'Openbaux Black Tick - Yearly',
    description: 'Get verified with the prestigious Black Tick for 365 days + 2 months bonus!'
  }
};

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json({
    plans: PLANS,
    benefits: {
      blackTick: 'Exclusive Black Tick verification badge',
      prioritySupport: '24/7 Priority customer support',
      excludedAds: 'Ad-free experience across the platform',
      analyticsAccess: 'Advanced analytics for your content',
      customBadge: 'Custom profile badge and themes'
    }
  });
});

// Create subscription order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (existingSubscription) {
      return res.status(400).json({ 
        message: 'You already have an active Black Tick subscription',
        subscription: existingSubscription
      });
    }

    const planDetails = PLANS[plan];
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: planDetails.price * 100, // Amount in paise
      currency: 'INR',
      receipt: `openbaux_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan: plan,
        planName: planDetails.name
      }
    });

    // Create subscription record
    const subscription = new Subscription({
      user: req.user._id,
      plan: plan,
      price: planDetails.price,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    await subscription.save();

    res.json({
      orderId: order.id,
      amount: planDetails.price,
      currency: 'INR',
      plan: planDetails,
      subscriptionId: subscription._id
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Verify payment and activate subscription
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Find subscription
    const subscription = await Subscription.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update subscription
    subscription.status = 'active';
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpaySignature = razorpay_signature;
    await subscription.save();

    // Update user with black tick
    const user = await User.findById(req.user._id);
    user.isVerified = true;
    user.subscription = subscription._id;
    user.subscriptionType = subscription.plan;
    user.blackTickExpiry = subscription.endDate;
    await user.save();

    res.json({
      message: 'Payment verified successfully! You now have the Black Tick!',
      subscription: subscription,
      user: {
        isVerified: user.isVerified,
        subscriptionType: user.subscriptionType,
        blackTickExpiry: user.blackTickExpiry
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Get current subscription
router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.json({ 
        hasSubscription: false,
        message: 'No active subscription found'
      });
    }

    const isActive = subscription.isActive();

    res.json({
      hasSubscription: true,
      isActive: isActive,
      subscription: subscription,
      daysLeft: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    // Keep black tick until expiry date
    res.json({
      message: 'Subscription cancelled. Black Tick will remain active until expiry date.',
      expiryDate: subscription.endDate
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Admin: Get all subscriptions (for admin panel)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin (you can implement admin role check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find()
      .populate('user', 'username fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Subscription.countDocuments();

    res.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// Get subscription statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const monthlyRevenue = await Subscription.aggregate([
      {
        $match: {
          status: 'active',
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats,
      monthlyRevenue: monthlyRevenue[0] || { revenue: 0, count: 0 }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;