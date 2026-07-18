const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [] // Ensures it initializes as an array
  }],
  // 🔹 ADD THIS FIELD
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [] // Ensures it initializes as an array
  }]
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);