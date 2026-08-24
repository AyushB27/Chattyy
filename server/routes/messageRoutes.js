const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/message");
const User = require("../models/user");
const Channel = require("../models/channel");
const Server = require("../models/server");

const router = express.Router();

/**
 * GET ALL RECENT DIRECT CONVERSATIONS (Friends + Non-Friends)
 */
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const myUser = await User.findOne({ email: req.user.email });
    if (!myUser) return res.status(404).json({ message: "User not found" });

    // Find all direct messages involving this user
    const messages = await Message.find({
      channelId: null,
      $or: [{ senderId: myUser._id }, { receiverId: myUser._id }],
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "username email avatar status customStatus")
      .populate("receiverId", "username email avatar status customStatus");

    // Group by the other user
    const conversationMap = new Map();

    for (const msg of messages) {
      if (!msg.senderId || !msg.receiverId) continue;

      const otherUser =
        msg.senderId._id.toString() === myUser._id.toString()
          ? msg.receiverId
          : msg.senderId;

      const otherUserId = otherUser._id.toString();

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: {
            text: msg.messageContent,
            timestamp: msg.createdAt,
            senderId: msg.senderId._id,
          },
        });
      }
    }

    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET CHANNEL MESSAGES
 */
router.get("/channel/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;

    const messages = await Message.find({ channelId })
      .populate({
        path: "senderId",
        select: "username email avatar status customStatus",
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username avatar",
        },
      })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching channel messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET DIRECT MESSAGES (By Friend/User ID)
 */
router.get("/dm/:friendId", authMiddleware, async (req, res) => {
  try {
    const myUser = await User.findOne({ email: req.user.email });
    if (!myUser) return res.status(404).json({ message: "User not found" });

    const friendId = req.params.friendId;

    const messages = await Message.find({
      channelId: null,
      $or: [
        { senderId: myUser._id, receiverId: friendId },
        { senderId: friendId, receiverId: myUser._id },
      ],
    })
      .populate({
        path: "senderId",
        select: "username email avatar status customStatus",
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username avatar",
        },
      })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching DM messages by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * BACKWARD-COMPATIBLE: GET DIRECT MESSAGES BY EMAIL
 */
router.get("/:friendEmail", authMiddleware, async (req, res) => {
  try {
    const myEmail = req.user.email;
    const friendEmail = req.params.friendEmail;

    const me = await User.findOne({ email: myEmail });
    const friend = await User.findOne({ email: friendEmail });

    if (!me || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      channelId: null,
      $or: [
        { senderId: me._id, receiverId: friend._id },
        { senderId: friend._id, receiverId: me._id },
      ],
    })
      .populate({
        path: "senderId",
        select: "username email avatar status customStatus",
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username avatar",
        },
      })
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      from: msg.senderId?.email || (msg.senderId?.toString() === me._id.toString() ? myEmail : friendEmail),
      to: msg.receiverId ? (msg.receiverId.toString() === me._id.toString() ? myEmail : friendEmail) : null,
      text: msg.messageContent,
      senderId: msg.senderId,
      timestamp: msg.createdAt,
      createdAt: msg.createdAt,
      reactions: msg.reactions || [],
      attachments: msg.attachments || [],
      replyTo: msg.replyTo,
      isEdited: msg.isEdited,
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * EDIT MESSAGE (Author Only)
 */
router.patch("/:messageId", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.messageContent = text.trim();
    message.isEdited = true;
    await message.save();

    const updated = await Message.findById(messageId)
      .populate({
        path: "senderId",
        select: "username email avatar status customStatus",
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username avatar",
        },
      });

    res.json({ message: "Message edited successfully", messageDoc: updated });
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE MESSAGE (Author or Server Admin)
 */
router.delete("/:messageId", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    let canDelete = message.senderId.toString() === user._id.toString();

    if (!canDelete && message.channelId) {
      const channel = await Channel.findById(message.channelId);
      if (channel) {
        const server = await Server.findById(channel.serverId);
        if (server) {
          const member = server.members.find(
            (m) => m.userId.toString() === user._id.toString()
          );
          if (member && (member.role === "owner" || member.role === "admin")) {
            canDelete = true;
          }
        }
      }
    }

    if (!canDelete) {
      return res.status(403).json({ message: "Permission denied" });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: "Message deleted successfully", messageId });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * TOGGLE EMOJI REACTION
 */
router.post("/:messageId/reaction", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ message: "Emoji is required" });

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.reactions = message.reactions || [];
    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex > -1) {
      const userIndex = message.reactions[reactionIndex].users.findIndex(
        (id) => id.toString() === user._id.toString()
      );

      if (userIndex > -1) {
        message.reactions[reactionIndex].users.splice(userIndex, 1);
        if (message.reactions[reactionIndex].users.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        message.reactions[reactionIndex].users.push(user._id);
      }
    } else {
      message.reactions.push({
        emoji,
        users: [user._id],
      });
    }

    await message.save();

    const updated = await Message.findById(messageId)
      .populate({
        path: "senderId",
        select: "username email avatar status customStatus",
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username avatar",
        },
      });

    res.json({ message: "Reaction updated", messageDoc: updated });
  } catch (error) {
    console.error("Error updating reaction:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;