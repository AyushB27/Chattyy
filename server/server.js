require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// 🔹 Import Models
const User = require("./models/user");
const Message = require("./models/message");
const ServerModel = require("./models/server");
const Channel = require("./models/channel");

// 🔹 Import Routes
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const serverRoutes = require("./routes/serverRoutes");
const channelRoutes = require("./routes/channelRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= API ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/channels", channelRoutes);

/* ================= SOCKET.IO SETUP ================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Map of userId -> Set of active socket IDs
const userSockets = new Map();
// Map of voice channelId -> Map of socketId -> { socketId, userId, username, avatar, isSpeaking }
const voiceChannels = new Map();

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
    } catch (err) {
      console.warn("Socket handshake token invalid:", err.message);
    }
  }
  next();
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Authenticate / Register user to room
  socket.on("authenticate", (userData) => {
    const userId = userData?._id || userData?.id || socket.user?.id;
    const email = userData?.email || socket.user?.email;

    if (userId) {
      socket.userId = userId.toString();
      socket.userEmail = email;

      // Join strictly the user's unique ID room
      socket.join(`user:${socket.userId}`);

      if (!userSockets.has(socket.userId)) {
        userSockets.set(socket.userId, new Set());
      }
      userSockets.get(socket.userId).add(socket.id);

      // Broadcast user status change
      io.emit("user:status_changed", {
        userId: socket.userId,
        email,
        status: userData?.status || "online",
      });

      console.log(`🟢 User authenticated into room user:${socket.userId}`);
    }
  });

  /* ================= CHANNEL ROOMS ================= */
  socket.on("join-channel", (channelId) => {
    if (channelId) {
      socket.join(`channel:${channelId}`);
    }
  });

  socket.on("leave-channel", (channelId) => {
    if (channelId) {
      socket.leave(`channel:${channelId}`);
    }
  });

  /* ================= SERVER ROOMS ================= */
  socket.on("join-server", (serverId) => {
    if (serverId) {
      socket.join(`server:${serverId}`);
    }
  });

  socket.on("leave-server", (serverId) => {
    if (serverId) {
      socket.leave(`server:${serverId}`);
    }
  });

  /* ================= CHANNEL MESSAGING ================= */
  socket.on("send-channel-message", async ({ channelId, text, replyTo, attachments, sender }) => {
    if (!channelId || !text) return;

    try {
      let senderId = socket.userId;
      if (!senderId && sender?.email) {
        const u = await User.findOne({ email: sender.email });
        if (u) senderId = u._id;
      }
      if (!senderId) return;

      const newMsg = await Message.create({
        senderId,
        channelId,
        messageContent: text.trim(),
        replyTo: replyTo || null,
        attachments: attachments || [],
      });

      const populated = await Message.findById(newMsg._id)
        .populate({
          path: "senderId",
          select: "username email avatar status customStatus",
        })
        .populate({
          path: "replyTo",
          populate: { path: "senderId", select: "username avatar" },
        });

      // Broadcast strictly once to the channel room
      io.to(`channel:${channelId}`).emit("receive-channel-message", populated);
    } catch (error) {
      console.error("❌ Error saving channel message:", error.message);
    }
  });

  /* ================= DIRECT MESSAGING ================= */
  socket.on("send-direct-message", async ({ toUserId, toEmail, text, replyTo, attachments, sender }) => {
    if (!text || (!toUserId && !toEmail)) return;

    try {
      let senderUser;
      if (socket.userId) {
        senderUser = await User.findById(socket.userId);
      } else if (sender?.email) {
        senderUser = await User.findOne({ email: sender.email });
      }

      let receiverUser;
      if (toUserId) {
        receiverUser = await User.findById(toUserId);
      } else if (toEmail) {
        receiverUser = await User.findOne({ email: toEmail });
      }

      if (!senderUser || !receiverUser) return;

      const newMsg = await Message.create({
        senderId: senderUser._id,
        receiverId: receiverUser._id,
        messageContent: text.trim(),
        replyTo: replyTo || null,
        attachments: attachments || [],
      });

      const populated = await Message.findById(newMsg._id)
        .populate({
          path: "senderId",
          select: "username email avatar status customStatus",
        })
        .populate({
          path: "replyTo",
          populate: { path: "senderId", select: "username avatar" },
        });

      // Emit strictly once to receiver's user room
      io.to(`user:${receiverUser._id.toString()}`).emit("receive-direct-message", populated);

      // Emit strictly once to sender's user room (if sender is not receiver)
      if (senderUser._id.toString() !== receiverUser._id.toString()) {
        io.to(`user:${senderUser._id.toString()}`).emit("receive-direct-message", populated);
      }
    } catch (error) {
      console.error("❌ Error sending direct message:", error.message);
    }
  });

  /* ================= TYPING INDICATORS ================= */
  socket.on("typing-start", ({ channelId, toUserId, user }) => {
    const payload = {
      userId: socket.userId || user?._id,
      username: user?.username || socket.userEmail,
      channelId,
      toUserId,
    };

    if (channelId) {
      socket.to(`channel:${channelId}`).emit("user:typing", payload);
    } else if (toUserId) {
      socket.to(`user:${toUserId}`).emit("user:typing", payload);
    }
  });

  socket.on("typing-stop", ({ channelId, toUserId, user }) => {
    const payload = {
      userId: socket.userId || user?._id,
      channelId,
      toUserId,
    };

    if (channelId) {
      socket.to(`channel:${channelId}`).emit("user:stop_typing", payload);
    } else if (toUserId) {
      socket.to(`user:${toUserId}`).emit("user:stop_typing", payload);
    }
  });

  /* ================= MESSAGE UPDATES ================= */
  socket.on("message:edit", ({ messageId, channelId, toUserId, text }) => {
    const payload = { messageId, text, isEdited: true };
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:updated", payload);
    } else if (toUserId) {
      io.to(`user:${toUserId}`).emit("message:updated", payload);
      if (socket.userId && socket.userId !== toUserId) {
        io.to(`user:${socket.userId}`).emit("message:updated", payload);
      }
    }
  });

  socket.on("message:delete", ({ messageId, channelId, toUserId }) => {
    const payload = { messageId };
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:deleted", payload);
    } else if (toUserId) {
      io.to(`user:${toUserId}`).emit("message:deleted", payload);
      if (socket.userId && socket.userId !== toUserId) {
        io.to(`user:${socket.userId}`).emit("message:deleted", payload);
      }
    }
  });

  socket.on("message:react", ({ messageDoc, channelId, toUserId }) => {
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:reaction_updated", messageDoc);
    } else if (toUserId) {
      io.to(`user:${toUserId}`).emit("message:reaction_updated", messageDoc);
      if (socket.userId && socket.userId !== toUserId) {
        io.to(`user:${socket.userId}`).emit("message:reaction_updated", messageDoc);
      }
    }
  });

  /* ================= USER STATUS BROADCAST ================= */
  socket.on("user:set_status", async ({ status, customStatus }) => {
    if (!socket.userId) return;

    try {
      const update = {};
      if (status) update.status = status;
      if (customStatus !== undefined) update.customStatus = customStatus;

      const updated = await User.findByIdAndUpdate(socket.userId, update, { new: true });
      if (updated) {
        io.emit("user:status_changed", {
          userId: updated._id,
          status: updated.status,
          customStatus: updated.customStatus,
        });
      }
    } catch (err) {
      console.error("Error updating user status:", err.message);
    }
  });

  /* ================= WebRTC VOICE CHANNELS ================= */
  socket.on("join-voice-channel", ({ channelId, user }) => {
    if (!channelId) return;

    socket.voiceChannelId = channelId;
    socket.join(`voice:${channelId}`);

    if (!voiceChannels.has(channelId)) {
      voiceChannels.set(channelId, new Map());
    }

    const channelUsers = voiceChannels.get(channelId);
    const userInfo = {
      socketId: socket.id,
      userId: socket.userId || user?._id,
      username: user?.username || "Unknown",
      avatar: user?.avatar || "",
      isSpeaking: false,
    };

    socket.to(`voice:${channelId}`).emit("voice-user-joined", userInfo);
    channelUsers.set(socket.id, userInfo);

    const existingUsers = Array.from(channelUsers.values());
    socket.emit("voice-channel-users", existingUsers);
    io.to(`voice:${channelId}`).emit("voice-users-updated", existingUsers);
  });

  socket.on("leave-voice-channel", ({ channelId }) => {
    const cId = channelId || socket.voiceChannelId;
    if (!cId) return;

    socket.leave(`voice:${cId}`);
    if (voiceChannels.has(cId)) {
      const channelUsers = voiceChannels.get(cId);
      channelUsers.delete(socket.id);
      if (channelUsers.size === 0) {
        voiceChannels.delete(cId);
      } else {
        io.to(`voice:${cId}`).emit("voice-users-updated", Array.from(channelUsers.values()));
      }
    }

    socket.to(`voice:${cId}`).emit("voice-user-left", { socketId: socket.id });
    socket.voiceChannelId = null;
  });

  socket.on("voice-signal", ({ toSocketId, signal }) => {
    io.to(toSocketId).emit("voice-signal", {
      fromSocketId: socket.id,
      signal,
    });
  });

  socket.on("voice-speaking", ({ channelId, isSpeaking }) => {
    const cId = channelId || socket.voiceChannelId;
    if (cId && voiceChannels.has(cId)) {
      const userMap = voiceChannels.get(cId);
      if (userMap.has(socket.id)) {
        userMap.get(socket.id).isSpeaking = isSpeaking;
        io.to(`voice:${cId}`).emit("voice-speaking-update", {
          socketId: socket.id,
          isSpeaking,
        });
      }
    }
  });

  /* ================= DISCONNECT ================= */
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);

    if (socket.voiceChannelId && voiceChannels.has(socket.voiceChannelId)) {
      const channelUsers = voiceChannels.get(socket.voiceChannelId);
      channelUsers.delete(socket.id);
      io.to(`voice:${socket.voiceChannelId}`).emit(
        "voice-users-updated",
        Array.from(channelUsers.values())
      );
      socket.to(`voice:${socket.voiceChannelId}`).emit("voice-user-left", { socketId: socket.id });
    }

    if (socket.userId && userSockets.has(socket.userId)) {
      const sockets = userSockets.get(socket.userId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSockets.delete(socket.userId);
        io.emit("user:status_changed", {
          userId: socket.userId,
          status: "offline",
        });
      }
    }
  });
});

/* ================= DATABASE CONNECTION & SERVER START ================= */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatty")
  .then(() => {
    console.log("✅ Connected to MongoDB Successfully!");
    server.listen(PORT, () => {
      console.log(`🚀 Chatty Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
  });