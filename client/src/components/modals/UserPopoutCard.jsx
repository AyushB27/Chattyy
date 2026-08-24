import React from "react";
import { MessageSquare, X, Shield } from "lucide-react";
import Avatar from "../common/Avatar";

export default function UserPopoutCard({ user, role, onClose, onDirectMessage }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-100">
      <div
        className="relative w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: "var(--bg-popover)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Banner Top */}
        <div className="h-22 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/30 p-1.5 rounded-full hover:bg-black/50 transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Avatar positioned over banner */}
        <div className="px-5 pb-5 -mt-10 relative">
          <div
            className="p-1 rounded-full inline-block mb-2 shadow-xl"
            style={{ backgroundColor: "var(--bg-popover)" }}
          >
            <Avatar
              src={user.avatar}
              name={user.username}
              status={user.status || "offline"}
              size="lg"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black leading-tight" style={{ color: "var(--text-primary)" }}>
                {user.username}
              </h3>
              {role && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {role}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
          </div>

          {user.customStatus && (
            <div
              className="mt-3 text-xs p-2.5 rounded-xl italic border"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              💬 "{user.customStatus}"
            </div>
          )}

          {user.bio && (
            <div className="mt-3">
              <div
                className="text-[10px] font-black uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                About Me
              </div>
              <p className="text-xs whitespace-pre-wrap font-medium" style={{ color: "var(--text-secondary)" }}>
                {user.bio}
              </p>
            </div>
          )}

          {onDirectMessage && (
            <div className="mt-5 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <button
                onClick={() => {
                  onDirectMessage(user);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              >
                <MessageSquare size={14} />
                Send Direct Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
