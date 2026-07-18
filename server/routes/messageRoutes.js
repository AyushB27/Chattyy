const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const User = require("../models/User");

const router = express.Router();

// Get conversation history with a specific user
router.get("/:friendEmail", authMiddleware, async (req, res) => {
  try {
    const myEmail = req.user.email; // From your JWT token
    const friendEmail = req.params.friendEmail;

    // Find both users to get their ObjectIds
    const me = await User.findOne({ email: myEmail });
    const friend = await User.findOne({ email: friendEmail });

    if (!me || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all messages where I am sender & they are receiver, OR they are sender & I am receiver
    const messages = await Message.find({
      $or: [
        { senderId: me._id, receiverId: friend._id },
        { senderId: friend._id, receiverId: me._id }
      ]
    }).sort({ createdAt: 1 }); // Sort by time created (oldest to newest)

    // Map over the results to format them safely for your frontend
    const formattedMessages = messages.map(msg => ({
      from: msg.senderId.toString() === me._id.toString() ? myEmail : friendEmail,
      to: msg.receiverId.toString() === me._id.toString() ? myEmail : friendEmail,
      text: msg.messageContent,
      timestamp: msg.createdAt
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;