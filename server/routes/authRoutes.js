const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/* =====================
   REGISTER
===================== */
router.post("/register", async (req, res) => {
  const { email, username, password, avatar } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: normalizedEmail,
      username: (username || normalizedEmail.split('@')[0]).trim(),
      password: hashedPassword,
      avatar: avatar || "",
      status: "online",
      friends: [],
      requests: [],
      sentRequests: [],
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar,
        status: newUser.status,
        customStatus: newUser.customStatus,
        bio: newUser.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* =====================
   LOGIN
===================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        status: user.status || "online",
        customStatus: user.customStatus || "",
        bio: user.bio || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;