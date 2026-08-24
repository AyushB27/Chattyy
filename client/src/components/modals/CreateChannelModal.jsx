import React, { useState } from "react";
import { X, Hash, Volume2 } from "lucide-react";
import api from "../../services/api";

export default function CreateChannelModal({
  isOpen,
  onClose,
  serverId,
  onChannelCreated,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [category, setCategory] = useState("TEXT CHANNELS");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return setError("Channel name is required");
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/channels", {
        name: name.trim(),
        type,
        serverId,
        category: category || (type === "voice" ? "VOICE CHANNELS" : "TEXT CHANNELS"),
        topic: topic.trim(),
      });
      setName("");
      setTopic("");
      onChannelCreated(res.data.channel);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: "var(--bg-popover)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2
            className="text-xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Create Channel
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            in {category || (type === "voice" ? "Voice Channels" : "Text Channels")}
          </p>
        </div>

        {error && (
          <div className="mx-6 mb-4 px-3.5 py-2 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Channel Type Selector */}
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              CHANNEL TYPE
            </label>
            <div className="space-y-2">
              <div
                onClick={() => {
                  setType("text");
                  setCategory("TEXT CHANNELS");
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                  type === "text"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-transparent hover:bg-white/5"
                }`}
                style={{
                  backgroundColor: type === "text" ? undefined : "var(--bg-card)",
                }}
              >
                <Hash size={22} className="text-indigo-400" />
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Text
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Post messages, images, memes, and code
                  </div>
                </div>
                <input
                  type="radio"
                  name="type"
                  checked={type === "text"}
                  onChange={() => {}}
                  className="accent-indigo-500"
                />
              </div>

              <div
                onClick={() => {
                  setType("voice");
                  setCategory("VOICE CHANNELS");
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                  type === "voice"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-transparent hover:bg-white/5"
                }`}
                style={{
                  backgroundColor: type === "voice" ? undefined : "var(--bg-card)",
                }}
              >
                <Volume2 size={22} className="text-indigo-400" />
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Voice
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Hang out in real-time with voice and speaking indicators
                  </div>
                </div>
                <input
                  type="radio"
                  name="type"
                  checked={type === "voice"}
                  onChange={() => {}}
                  className="accent-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              CHANNEL NAME
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">
                {type === "voice" ? <Volume2 size={16} /> : <Hash size={16} />}
              </span>
              <input
                type="text"
                required
                placeholder="new-channel"
                value={name}
                onChange={(e) =>
                  setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              TOPIC (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="What is this channel for?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:underline cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
