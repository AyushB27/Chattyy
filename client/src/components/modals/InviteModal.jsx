import React, { useState } from "react";
import { X, Copy, Check, UserPlus } from "lucide-react";

export default function InviteModal({ isOpen, onClose, server }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !server) return null;

  const inviteCode = server.inviteCode || "code";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <UserPlus size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Invite Friends</span>
          </div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Invite friends to {server.name}
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Share this invite code with your friends to let them join your server instantly!
          </p>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              SERVER INVITE CODE
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteCode}
                className="flex-1 px-3.5 py-2.5 rounded-xl outline-none text-sm font-mono tracking-wider border font-bold"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-md cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div
            className="text-xs p-3.5 rounded-xl border"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            💡 Friends can click the Compass icon on the left rail and enter this code to join.
          </div>
        </div>
      </div>
    </div>
  );
}
