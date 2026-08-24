const mongoose = require('mongoose');
const crypto = require('crypto');

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  icon: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
    maxlength: 300,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inviteCode: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(4).toString('hex'), // e.g. 8 chars
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    default: [],
  }],
}, { timestamps: true });

module.exports = mongoose.model('Server', serverSchema);
