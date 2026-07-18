const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Fetch the user, but exclude the password field for security (-password)
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

module.exports = router;