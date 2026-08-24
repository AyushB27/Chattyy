const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    default: null,
  },
  messageContent: {
    type: String,
    required: true,
    trim: true,
  },
  attachments: [{
    url: String,
    fileType: String,
    fileName: String,
  }],
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  isEdited: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Compound indexes for optimal query speeds
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ channelId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);