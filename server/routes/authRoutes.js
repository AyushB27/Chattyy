const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // 🔹 Import your Mongoose model

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; 

/* =====================
   REGISTER
===================== */
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // 🔹 Query the database to see if the user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password securely [cite: 215]
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Permanently save the user to MongoDB [cite: 215]
    await User.create({
      email,
      username: username || email.split('@')[0], // Fallback if frontend doesn't send username
      password: hashedPassword,
      friends: [],
      requests: [],
    });

    res.json({ message: "Registered successfully" });
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
    // 🔹 Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the submitted password with the hashed one in the database
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate the JWT token
    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;