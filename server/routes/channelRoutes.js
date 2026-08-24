const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Server = require("../models/server");
const Channel = require("../models/channel");
const User = require("../models/user");

const router = express.Router();

/**
 * CREATE CHANNEL IN A SERVER
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, type, serverId, category, topic } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Channel name is required" });
    }
    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const member = server.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return res.status(403).json({ message: "Only owners or admins can create channels" });
    }

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, "-");

    const channel = await Channel.create({
      name: cleanName,
      type: type === "voice" ? "voice" : "text",
      serverId: server._id,
      category: category ? category.toUpperCase().trim() : (type === "voice" ? "VOICE CHANNELS" : "TEXT CHANNELS"),
      topic: topic ? topic.trim() : "",
    });

    server.channels.push(channel._id);
    await server.save();

    res.status(201).json({
      message: "Channel created successfully",
      channel,
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * UPDATE CHANNEL
 */
router.patch("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, category, topic } = req.body;

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const server = await Server.findById(channel.serverId);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const member = server.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (name) channel.name = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (category) channel.category = category.toUpperCase().trim();
    if (topic !== undefined) channel.topic = topic.trim();

    await channel.save();

    res.json({ message: "Channel updated successfully", channel });
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE CHANNEL
 */
router.delete("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const server = await Server.findById(channel.serverId);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const member = server.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Remove from server channels array
    server.channels = server.channels.filter(
      (id) => id.toString() !== channel._id.toString()
    );
    await server.save();

    await Channel.findByIdAndDelete(channel._id);

    res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
