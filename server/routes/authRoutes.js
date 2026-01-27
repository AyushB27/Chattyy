const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = "supersecretkey";

// 🔹 In-memory users
const users = [];

/* =====================
   AUTH MIDDLEWARE
===================== */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.email = decoded.email;
    next();
  } catch {
    res.sendStatus(403);
  }
};

/* =====================
   REGISTER
===================== */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const exists = users.find(u => u.email === email);
  if (exists)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    email,
    password: hashedPassword,
    friends: [],
    requests: [],
  });

  console.log("REGISTERED USERS:", users);

  res.json({ message: "Registered successfully" });
});

/* =====================
   LOGIN
===================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user)
    return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Login successful", token });
});

/* =====================
   FRIEND REQUEST
===================== */
router.post("/friend/request", authMiddleware, (req, res) => {
  const { toEmail } = req.body;

  const sender = users.find(u => u.email === req.email);
  const receiver = users.find(u => u.email === toEmail);

  if (!receiver)
    return res.status(404).json({ message: "User not found" });

  if (receiver.requests.includes(req.email))
    return res.status(400).json({ message: "Already requested" });

  receiver.requests.push(req.email);

  res.json({ message: "Friend request sent" });
});

/* =====================
   ACCEPT FRIEND
===================== */
router.post("/friend/accept", authMiddleware, (req, res) => {
  const { fromEmail } = req.body;

  const user = users.find(u => u.email === req.email);
  const requester = users.find(u => u.email === fromEmail);

  user.requests = user.requests.filter(e => e !== fromEmail);
  user.friends.push(fromEmail);
  requester.friends.push(req.email);

  res.json({ message: "Friend added" });
});

/* =====================
   LIST FRIENDS
===================== */
router.get("/friends", authMiddleware, (req, res) => {
  const user = users.find(u => u.email === req.email);

  res.json({
    friends: user.friends,
    requests: user.requests,
  });
});

module.exports = router;
