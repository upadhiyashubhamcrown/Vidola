const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        // Monthly: ₹99, Yearly: ₹999
        return (this.plan === 'monthly' && v === 99) || 
               (this.plan === 'yearly' && v === 999);
      },
      message: 'Invalid price for subscription plan'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  benefits: {
    blackTick: {
      type: Boolean,
      default: true
    },
    prioritySupport: {
      type: Boolean,
      default: true
    },
    excludedAds: {
      type: Boolean,
      default: true
    },
    analyticsAccess: {
      type: Boolean,
      default: true
    },
    customBadge: {
      type: Boolean,
      default: true
    }
  },
  autoRenew: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate end date based on plan
subscriptionSchema.pre('save', function(next) {
  if (this.isNew) {
    const startDate = this.startDate || new Date();
    if (this.plan === 'monthly') {
      // Add 30 days
      this.endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    } else if (this.plan === 'yearly') {
      // Add 365 days
      this.endDate = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
    }
  }
  next();
});

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Auto-expire expired subscriptions
subscriptionSchema.statics.expireOldSubscriptions = async function() {
  const expiredSubs = await this.find({
    status: 'active',
    endDate: { $lt: new Date() }
  });

  for (let sub of expiredSubs) {
    sub.status = 'expired';
    await sub.save();
    
    // Remove black tick from user
    await mongoose.model('User').findByIdAndUpdate(sub.user, {
      isVerified: false,
      subscription: null
    });
  }
};

// Index for faster queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);