import React, { useState } from "react";
import { X, Compass } from "lucide-react";
import api from "../../services/api";

export default function JoinServerModal({ isOpen, onClose, onServerJoined }) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      return setError("Invite code is required");
    }

    setLoading(true);
    setError("");

    let code = inviteCode.trim();
    if (code.includes("/")) {
      code = code.split("/").pop();
    }

    try {
      const res = await api.post(`/api/servers/join/${code}`);
      setInviteCode("");
      onServerJoined(res.data.server);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired invite code.");
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
          <div className="mx-auto w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-3">
            <Compass size={28} />
          </div>
          <h2
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Join a Server
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Enter an invite code or link to join an existing server instantly.
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
              INVITE CODE OR LINK
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 7f8a9b1c"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
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
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading ? "Joining..." : "Join Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
