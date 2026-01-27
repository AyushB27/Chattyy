const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const friendRoutes = require("./routes/friendRoutes");

const app = express();
const server = http.createServer(app);

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/friends", friendRoutes);

/* ================= SOCKET.IO SETUP ================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST"],
  },
});

// email -> socketId
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User joins with email
  socket.on("join", (email) => {
    onlineUsers[email] = socket.id;
    console.log("🟢 Online users:", onlineUsers);
  });

  // Handle sending messages
  socket.on("send-message", ({ from, to, text }) => {
    const receiverSocket = onlineUsers[to];
    const senderSocket = onlineUsers[from];

    const messagePayload = {
      from,
      to,
      text,
      timestamp: Date.now(),
    };

    // Send to receiver
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-message", messagePayload);
    }

    // Echo back to sender (important for UI)
    if (senderSocket) {
      io.to(senderSocket).emit("receive-message", messagePayload);
    }
  });

  socket.on("disconnect", () => {
    for (const email in onlineUsers) {
      if (onlineUsers[email] === socket.id) {
        delete onlineUsers[email];
        break;
      }
    }
    console.log("🔴 User disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
