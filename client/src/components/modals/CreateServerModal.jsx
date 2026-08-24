import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import api from "../../services/api";

export default function CreateServerModal({ isOpen, onClose, onServerCreated }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return setError("Server name is required");
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/servers", {
        name: name.trim(),
        icon: icon.trim(),
        description: description.trim(),
      });
      setName("");
      setIcon("");
      setDescription("");
      onServerCreated(res.data.server);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create server");
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
        <div className="p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Create Your Server
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Your server is where you and your community hang out. Make yours and start chatting.
          </p>
        </div>

        {error && (
          <div className="mx-6 mb-4 px-3.5 py-2 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              SERVER NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cyber Squad or Study Lounge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              SERVER ICON URL (OPTIONAL)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              TOPIC / DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="What's this server about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition resize-none"
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
              {loading ? "Creating..." : "Create Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
