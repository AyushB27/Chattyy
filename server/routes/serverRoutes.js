const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Server = require("../models/server");
const Channel = require("../models/channel");
const User = require("../models/user");
const crypto = require("crypto");

const router = express.Router();

/**
 * CREATE A NEW SERVER
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Server name is required" });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Create Server document
    const newServer = new Server({
      name: name.trim(),
      icon: icon || "",
      description: description || "",
      ownerId: user._id,
      inviteCode: crypto.randomBytes(4).toString("hex"),
      members: [{ userId: user._id, role: "owner" }],
      channels: [],
    });

    await newServer.save();

    // 2. Create Default Channels (#general text channel + 🔊 Voice Lounge)
    const defaultTextChannel = await Channel.create({
      name: "general",
      type: "text",
      serverId: newServer._id,
      category: "TEXT CHANNELS",
      topic: "Welcome to the general channel!",
    });

    const defaultVoiceChannel = await Channel.create({
      name: "Voice Lounge",
      type: "voice",
      serverId: newServer._id,
      category: "VOICE CHANNELS",
      topic: "Casual voice chat",
    });

    newServer.channels = [defaultTextChannel._id, defaultVoiceChannel._id];
    await newServer.save();

    // 3. Return populated server
    const populatedServer = await Server.findById(newServer._id)
      .populate("channels")
      .populate({
        path: "members.userId",
        select: "username email avatar status customStatus",
      });

    res.status(201).json({
      message: "Server created successfully",
      server: populatedServer,
    });
  } catch (error) {
    console.error("Error creating server:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET ALL SERVERS FOR CURRENT USER
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const servers = await Server.find({ "members.userId": user._id })
      .populate("channels")
      .populate({
        path: "members.userId",
        select: "username email avatar status customStatus",
      })
      .sort({ createdAt: 1 });

    res.json(servers);
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET SINGLE SERVER DETAILS
 */
router.get("/:serverId", authMiddleware, async (req, res) => {
  try {
    const { serverId } = req.params;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const server = await Server.findById(serverId)
      .populate("channels")
      .populate({
        path: "members.userId",
        select: "username email avatar status customStatus",
      });

    if (!server) return res.status(404).json({ message: "Server not found" });

    // Ensure requesting user is a member
    const isMember = server.members.some(
      (m) => m.userId && m.userId._id.toString() === user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    res.json(server);
  } catch (error) {
    console.error("Error fetching server:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * JOIN SERVER VIA INVITE CODE
 */
router.post("/join/:inviteCode", authMiddleware, async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const server = await Server.findOne({ inviteCode })
      .populate("channels")
      .populate({
        path: "members.userId",
        select: "username email avatar status customStatus",
      });

    if (!server) {
      return res.status(404).json({ message: "Invalid or expired invite link" });
    }

    const alreadyMember = server.members.some(
      (m) => m.userId && m.userId._id.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.json({ message: "You are already a member of this server", server });
    }

    server.members.push({ userId: user._id, role: "member" });
    await server.save();

    const updatedServer = await Server.findById(server._id)
      .populate("channels")
      .populate({
        path: "members.userId",
        select: "username email avatar status customStatus",
      });

    res.json({ message: `Successfully joined ${server.name}!`, server: updatedServer });
  } catch (error) {
    console.error("Error joining server:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * UPDATE SERVER (OWNER/ADMIN ONLY)
 */
router.patch("/:serverId", authMiddleware, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { name, icon, description } = req.body;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const member = server.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return res.status(403).json({ message: "Only server owners or admins can edit server settings" });
    }

    if (name) server.name = name.trim();
    if (icon !== undefined) server.icon = icon;
    if (description !== undefined) server.description = description;

    await server.save();

    const updated = await Server.findById(serverId)
      .populate("channels")
      .populate({
        path: "members.userId",
        select: "username email avatar status customStatus",
      });

    res.json({ message: "Server updated successfully", server: updated });
  } catch (error) {
    console.error("Error updating server:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE SERVER OR LEAVE SERVER
 */
router.delete("/:serverId", authMiddleware, async (req, res) => {
  try {
    const { serverId } = req.params;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const isOwner = server.ownerId.toString() === user._id.toString();

    if (isOwner) {
      // Delete all channels and the server
      await Channel.deleteMany({ serverId: server._id });
      await Server.findByIdAndDelete(server._id);
      return res.json({ message: "Server deleted successfully" });
    } else {
      // Leave server
      server.members = server.members.filter(
        (m) => m.userId.toString() !== user._id.toString()
      );
      await server.save();
      return res.json({ message: "You left the server" });
    }
  } catch (error) {
    console.error("Error deleting/leaving server:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
