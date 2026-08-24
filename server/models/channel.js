const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text',
  },
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
  },
  category: {
    type: String,
    default: 'TEXT CHANNELS',
    trim: true,
  },
  topic: {
    type: String,
    default: '',
    maxlength: 300,
  },
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
