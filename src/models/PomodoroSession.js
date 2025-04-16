import mongoose from 'mongoose';

const PomodoroSessionSchema = new mongoose.Schema({
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
  messageId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['focus', 'break', 'completed', 'cancelled'],
    default: 'focus'
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 120 // Maximum 2 hours
  },
  breakDuration: {
    type: Number,
    required: true,
    min: 1,
    max: 60 // Maximum 1 hour
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedBreak: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('PomodoroSession', PomodoroSessionSchema); 