const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// TEMP in-memory store
const users = {};
// users[email] = { friends: [], requests: [] }

// Ensure user exists
const ensureUser = (email) => {
  if (!users[email]) {
    users[email] = { friends: [], requests: [] };
  }
};

/**
 * SEND FRIEND REQUEST
 */
router.post("/add", authMiddleware, (req, res) => {
  const from = req.user.email;
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({ message: "Target email required" });
  }

  if (from === to) {
    return res.status(400).json({ message: "You cannot add yourself" });
  }

  ensureUser(from);
  ensureUser(to);

  if (users[from].friends.includes(to)) {
    return res.status(400).json({ message: "Already friends" });
  }

  if (users[to].requests.includes(from)) {
    return res.status(400).json({ message: "Request already sent" });
  }

  users[to].requests.push(from);

  res.json({ message: "Friend request sent" });
});

/**
 * ACCEPT FRIEND REQUEST
 */
router.post("/accept", authMiddleware, (req, res) => {
  const me = req.user.email;
  const { from } = req.body;

  if (!from) {
    return res.status(400).json({ message: "Sender email required" });
  }

  ensureUser(me);
  ensureUser(from);

  if (!users[me].requests.includes(from)) {
    return res.status(400).json({ message: "No such request" });
  }

  // Remove request
  users[me].requests = users[me].requests.filter(r => r !== from);

  // Add to friends (both sides)
  users[me].friends.push(from);
  users[from].friends.push(me);

  res.json({ message: "Friend request accepted" });
});

/**
 * GET FRIENDS & REQUESTS
 */
router.get("/list", authMiddleware, (req, res) => {
  const email = req.user.email;
  ensureUser(email);

  res.json({
    friends: users[email].friends,
    requests: users[email].requests
  });
});

module.exports = router;
