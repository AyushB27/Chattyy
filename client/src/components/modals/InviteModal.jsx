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
          <div className="flex items-center gap-2 text-[#5865f2] mb-1">
            <UserPlus size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Invite Friends</span>
          </div>
          <h2 className="text-xl font-bold text-[#f2f3f5]">
            Invite friends to {server.name}
          </h2>
          <p className="text-xs text-[#949ba4] mt-1">
            Share this invite code with others to grant them access to this server.
          </p>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              SERVER INVITE CODE
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteCode}
                className="flex-1 px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm font-mono tracking-wider border border-[#1f2023]"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition cursor-pointer ${
                  copied
                    ? "bg-[#23a55a] text-white"
                    : "bg-[#5865f2] hover:bg-[#4752c4] text-white"
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="text-xs p-2.5 rounded bg-[#2b2d31] text-[#949ba4] border border-[#1f2023]">
            Members can join by clicking Explore / Join on the server rail and pasting this code.
          </div>
        </div>
      </div>
    </div>
  );
}
