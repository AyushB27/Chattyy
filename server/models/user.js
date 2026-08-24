const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['online', 'idle', 'dnd', 'offline'],
    default: 'online',
  },
  customStatus: {
    type: String,
    default: '',
    maxlength: 100,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 200,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  sentRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);