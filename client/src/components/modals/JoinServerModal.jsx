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
            Join a Server
          </h2>
          <p className="text-xs text-[#949ba4] mt-1">
            Enter an invite code below to join an existing server.
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
              INVITE CODE OR LINK <span className="text-[#f23f43]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 7f8a9b1c"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#35363c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#f2f3f5] hover:underline cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Joining..." : "Join Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
