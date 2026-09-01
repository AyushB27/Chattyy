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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-100">
      <div
        className="relative w-full max-w-md rounded-lg shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: "#313338",
          borderColor: "#1f2023",
        }}
      >
        {/* Header */}
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#949ba4] hover:text-[#f2f3f5] transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#f2f3f5]">
            Create Channel
          </h2>
          <p className="text-xs text-[#949ba4] mt-0.5">
            in {category || (type === "voice" ? "Voice Channels" : "Text Channels")}
          </p>
        </div>

        {error && (
          <div className="mx-6 mb-3 p-2 bg-[#f23f43]/10 border border-[#f23f43]/50 rounded text-[#f23f43] text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Channel Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              CHANNEL TYPE
            </label>
            <div className="space-y-2">
              <div
                onClick={() => {
                  setType("text");
                  setCategory("TEXT CHANNELS");
                }}
                className={`flex items-center gap-3 p-2.5 rounded cursor-pointer border transition ${
                  type === "text"
                    ? "border-[#5865f2] bg-[#2b2d31]"
                    : "border-[#1f2023] bg-[#1e1f22] hover:bg-[#2b2d31]"
                }`}
              >
                <Hash size={20} className="text-[#949ba4]" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#f2f3f5]">
                    Text
                  </div>
                  <div className="text-xs text-[#949ba4]">
                    Post messages, images, memes, and opinions
                  </div>
                </div>
                <input
                  type="radio"
                  name="type"
                  checked={type === "text"}
                  onChange={() => {}}
                  className="accent-[#5865f2]"
                />
              </div>

              <div
                onClick={() => {
                  setType("voice");
                  setCategory("VOICE CHANNELS");
                }}
                className={`flex items-center gap-3 p-2.5 rounded cursor-pointer border transition ${
                  type === "voice"
                    ? "border-[#5865f2] bg-[#2b2d31]"
                    : "border-[#1f2023] bg-[#1e1f22] hover:bg-[#2b2d31]"
                }`}
              >
                <Volume2 size={20} className="text-[#949ba4]" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#f2f3f5]">
                    Voice
                  </div>
                  <div className="text-xs text-[#949ba4]">
                    Hang out together with voice and live indicators
                  </div>
                </div>
                <input
                  type="radio"
                  name="type"
                  checked={type === "voice"}
                  onChange={() => {}}
                  className="accent-[#5865f2]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              CHANNEL NAME
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#949ba4]">
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
                className="w-full pl-9 pr-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              TOPIC (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="What is this channel for?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#35363c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#f2f3f5] hover:underline cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
