const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

const router = express.Router();

/**
 * SEND FRIEND REQUEST
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const fromEmail = req.user.email.toLowerCase();
    const { to } = req.body;

    if (!to) return res.status(400).json({ message: "Target email is required" });
    const targetEmail = to.toLowerCase().trim();

    if (fromEmail === targetEmail) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    const sender = await User.findOne({ email: fromEmail });
    const receiver = await User.findOne({ email: targetEmail });

    if (!sender) return res.status(404).json({ message: "Sender not found" });
    if (!receiver) return res.status(404).json({ message: "User not found with this email" });

    // Initialize arrays safely
    sender.friends = sender.friends || [];
    sender.sentRequests = sender.sentRequests || [];
    receiver.friends = receiver.friends || [];
    receiver.requests = receiver.requests || [];

    // Check if already friends
    const isAlreadyFriends = receiver.friends.some(
      (id) => id.toString() === sender._id.toString()
    );
    if (isAlreadyFriends) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check if request already sent
    const isRequestPending = receiver.requests.some(
      (id) => id.toString() === sender._id.toString()
    );
    if (isRequestPending) {
      return res.status(400).json({ message: "Friend request already sent and pending" });
    }

    // Check if the other person already sent a request to us -> Auto-accept!
    const reciprocalRequest = sender.requests.some(
      (id) => id.toString() === receiver._id.toString()
    );
    if (reciprocalRequest) {
      // Auto accept
      sender.requests = sender.requests.filter(id => id.toString() !== receiver._id.toString());
      receiver.sentRequests = receiver.sentRequests.filter(id => id.toString() !== sender._id.toString());
      sender.friends.push(receiver._id);
      receiver.friends.push(sender._id);
      await sender.save();
      await receiver.save();
      return res.json({ message: "Friend request accepted! You are now friends." });
    }

    // Add sender to receiver's requests
    receiver.requests.push(sender._id);
    sender.sentRequests.push(receiver._id);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error in /friends/add:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ACCEPT FRIEND REQUEST
 */
router.post("/accept", authMiddleware, async (req, res) => {
  try {
    const myEmail = req.user.email.toLowerCase();
    const { from } = req.body;

    if (!from) return res.status(400).json({ message: "Sender email is required" });

    const me = await User.findOne({ email: myEmail });
    const sender = await User.findOne({ email: from.toLowerCase().trim() });

    if (!me || !sender) return res.status(404).json({ message: "User not found" });

    me.requests = me.requests || [];
    me.friends = me.friends || [];
    sender.friends = sender.friends || [];
    sender.sentRequests = sender.sentRequests || [];

    // Ensure the request exists
    const hasRequest = me.requests.some(id => id.toString() === sender._id.toString());
    if (!hasRequest) {
      return res.status(400).json({ message: "No pending friend request from this user" });
    }

    // Remove from requests / sentRequests
    me.requests = me.requests.filter(id => id.toString() !== sender._id.toString());
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== me._id.toString());

    // Add to friends if not already present
    if (!me.friends.some(id => id.toString() === sender._id.toString())) {
      me.friends.push(sender._id);
    }
    if (!sender.friends.some(id => id.toString() === me._id.toString())) {
      sender.friends.push(me._id);
    }

    await me.save();
    await sender.save();

    res.json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error in /friends/accept:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * REJECT FRIEND REQUEST
 */
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const myEmail = req.user.email.toLowerCase();
    const { from } = req.body;

    if (!from) return res.status(400).json({ message: "Sender email is required" });

    const me = await User.findOne({ email: myEmail });
    const sender = await User.findOne({ email: from.toLowerCase().trim() });

    if (!me || !sender) return res.status(404).json({ message: "User not found" });

    me.requests = (me.requests || []).filter(id => id.toString() !== sender._id.toString());
    sender.sentRequests = (sender.sentRequests || []).filter(id => id.toString() !== me._id.toString());

    await me.save();
    await sender.save();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in /friends/reject:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * CANCEL SENT FRIEND REQUEST
 */
router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    const myEmail = req.user.email.toLowerCase();
    const { to } = req.body;

    if (!to) return res.status(400).json({ message: "Target email is required" });

    const me = await User.findOne({ email: myEmail });
    const receiver = await User.findOne({ email: to.toLowerCase().trim() });

    if (!me || !receiver) return res.status(404).json({ message: "User not found" });

    me.sentRequests = (me.sentRequests || []).filter(id => id.toString() !== receiver._id.toString());
    receiver.requests = (receiver.requests || []).filter(id => id.toString() !== me._id.toString());

    await me.save();
    await receiver.save();

    res.json({ message: "Friend request cancelled" });
  } catch (error) {
    console.error("Error in /friends/cancel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * REMOVE FRIEND (UNFRIEND)
 */
router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const myEmail = req.user.email.toLowerCase();
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Friend email is required" });

    const me = await User.findOne({ email: myEmail });
    const friend = await User.findOne({ email: email.toLowerCase().trim() });

    if (!me || !friend) return res.status(404).json({ message: "User not found" });

    me.friends = (me.friends || []).filter(id => id.toString() !== friend._id.toString());
    friend.friends = (friend.friends || []).filter(id => id.toString() !== me._id.toString());

    await me.save();
    await friend.save();

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in /friends/remove:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET FRIENDS, PENDING REQUESTS, & SENT REQUESTS
 */
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email.toLowerCase() })
      .populate({
        path: "friends",
        select: "username email avatar status customStatus bio",
      })
      .populate({
        path: "requests",
        select: "username email avatar status customStatus bio",
      })
      .populate({
        path: "sentRequests",
        select: "username email avatar status customStatus bio",
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      friends: user.friends || [],
      requests: user.requests || [],
      sentRequests: user.sentRequests || [],
    });
  } catch (error) {
    console.error("Error in /friends/list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;