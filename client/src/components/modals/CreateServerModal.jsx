import React, { useState } from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-100">
      <div
        className="relative w-full max-w-md rounded-lg shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: "#313338",
          borderColor: "#1f2023",
        }}
      >
        {/* Header */}
        <div className="p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#949ba4] hover:text-[#f2f3f5] transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#f2f3f5]">
            Create Your Server
          </h2>
          <p className="text-xs text-[#949ba4] mt-1">
            Your server is where you and your friends hang out. Make yours and start talking.
          </p>
        </div>

        {error && (
          <div className="mx-6 mb-3 p-2 bg-[#f23f43]/10 border border-[#f23f43]/50 rounded text-[#f23f43] text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              SERVER NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Squad Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              SERVER ICON URL (OPTIONAL)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              TOPIC / DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="What is this server about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2] resize-none"
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
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
