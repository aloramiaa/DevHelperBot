import mongoose from 'mongoose';

const NewsSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  serverId: {
    type: String,
    required: true,
    index: true
  },
  channelId: {
    type: String,
    required: true
  },
  sources: {
    type: [String],
    enum: ['devto', 'hackernews', 'reddit'],
    default: ['devto', 'hackernews']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  tags: {
    type: [String],
    default: []
  },
  lastSent: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
NewsSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('NewsSubscription', NewsSubscriptionSchema); 