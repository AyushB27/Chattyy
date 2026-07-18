require('dotenv').config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// 🔹 Import your Models
const User = require("./models/User");
const Message = require("./models/Message");

// 🔹 Import your Routes
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes"); 

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes); // 🔹 Your new message history route

/* ================= SOCKET.IO SETUP ================= */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST"],
  },
});

// Maps user email to their active socketId
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User joins with email
  socket.on("join", (email) => {
    onlineUsers[email] = socket.id;
    console.log("🟢 Online users:", onlineUsers);
  });

  // Handle sending messages (Now async so we can use await with MongoDB)
  socket.on("send-message", async ({ from, to, text }) => {
    const receiverSocket = onlineUsers[to];
    const senderSocket = onlineUsers[from];

    const messagePayload = {
      from,
      to,
      text,
      timestamp: Date.now(),
    };

    // 1. Emit to receiver (Real-time delivery)
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-message", messagePayload);
    }

    // 2. Echo back to sender (Updates the sender's UI instantly)
    if (senderSocket) {
      io.to(senderSocket).emit("receive-message", messagePayload);
    }

    // 3. 🔹 NEW: Save the message permanently to MongoDB
    try {
      const sender = await User.findOne({ email: from });
      const receiver = await User.findOne({ email: to });

      if (sender && receiver) {
        await Message.create({
          senderId: sender._id,
          receiverId: receiver._id,
          messageContent: text,
        });
      }
    } catch (error) {
      console.error("❌ Error saving message to DB:", error.message);
    }
  });

  // Handle user disconnect
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

/* ================= DATABASE CONNECTION & START SERVER ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Successfully!");
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
  });