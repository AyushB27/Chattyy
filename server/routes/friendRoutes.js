const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * SEND FRIEND REQUEST
 */
router.post("/add", authMiddleware, async (req, res) => {
  console.log("DEBUG: Incoming /add request from:", req.user?.email);
  
  try {
    const fromEmail = req.user.email;
    const { to } = req.body;

    console.log("DEBUG: Target friend email:", to);

    if (!to) return res.status(400).json({ message: "Target email required" });
    if (fromEmail === to) return res.status(400).json({ message: "You cannot add yourself" });

    const sender = await User.findOne({ email: fromEmail });
    const receiver = await User.findOne({ email: to });

    console.log("DEBUG: Sender found:", sender ? sender._id : "NOT FOUND");
    console.log("DEBUG: Receiver found:", receiver ? receiver._id : "NOT FOUND");

    if (!sender) return res.status(404).json({ message: "Sender not found" });
    if (!receiver) return res.status(404).json({ message: "User not found" });

    // SAFE ACCESS: Initialize arrays if they are undefined to prevent .includes() crash
    const receiverFriends = receiver.friends || [];
    const receiverRequests = receiver.requests || [];

    // Check if already friends or request already sent
    if (receiverFriends.includes(sender._id)) {
      return res.status(400).json({ message: "Already friends" });
    }
    if (receiverRequests.includes(sender._id)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Add sender's ID to receiver's requests
    // Explicitly re-assign to ensure the document has the array
    receiver.requests = receiverRequests; 
    receiver.requests.push(sender._id);
    await receiver.save();

    console.log("DEBUG: Request saved successfully");
    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.error("CRITICAL ERROR IN /add:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ACCEPT FRIEND REQUEST
 */
router.post("/accept", authMiddleware, async (req, res) => {
  try {
    const myEmail = req.user.email;
    const { from } = req.body;

    console.log("DEBUG: Accepting request from:", from);

    if (!from) return res.status(400).json({ message: "Sender email required" });

    const me = await User.findOne({ email: myEmail });
    const sender = await User.findOne({ email: from });

    if (!me || !sender) return res.status(404).json({ message: "User not found" });

    // SAFE ACCESS: Initialize arrays
    const myRequests = me.requests || [];

    // Ensure the request exists
    if (!myRequests.includes(sender._id)) {
      return res.status(400).json({ message: "No such request" });
    }

    // Remove from requests array
    me.requests = myRequests.filter(id => id.toString() !== sender._id.toString());

    // Add to friends (both sides)
    me.friends = me.friends || [];
    sender.friends = sender.friends || [];
    
    me.friends.push(sender._id);
    sender.friends.push(me._id);

    await me.save();
    await sender.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("CRITICAL ERROR IN /accept:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET FRIENDS & REQUESTS
 */
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
      .populate({
        path: "friends",
        select: "username email",
        options: { strictPopulate: false }
      })
      .populate({
        path: "requests",
        select: "username email",
        options: { strictPopulate: false }
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      friends: user.friends || [],
      requests: user.requests || []
    });
  } catch (error) {
    console.error("CRITICAL ERROR IN /list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;