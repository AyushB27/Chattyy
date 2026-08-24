const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

const router = express.Router();

/**
 * GET CURRENT USER PROFILE
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userProfile = await User.findOne({ email: req.user.email }).select("-password");
    if (!userProfile) return res.status(404).json({ message: "Profile not found" });

    res.json({
      message: "Protected data accessed",
      user: userProfile
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * UPDATE USER PROFILE (Avatar, bio, customStatus, status, username)
 */
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, avatar, bio, customStatus, status } = req.body;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username !== undefined) user.username = username.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (customStatus !== undefined) user.customStatus = customStatus;
    if (status !== undefined && ['online', 'idle', 'dnd', 'offline'].includes(status)) {
      user.status = status;
    }

    await user.save();

    const sanitized = user.toObject();
    delete sanitized.password;

    res.json({
      message: "Profile updated successfully",
      user: sanitized,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;