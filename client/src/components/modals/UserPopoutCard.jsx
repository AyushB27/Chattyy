import React from "react";
import { MessageSquare, X } from "lucide-react";
import Avatar from "../common/Avatar";

export default function UserPopoutCard({ user, role, onClose, onDirectMessage }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-100">
      <div
        className="relative w-full max-w-xs rounded-lg shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: "#232428",
          borderColor: "#1f2023",
        }}
      >
        {/* Banner Top */}
        <div className="h-16 bg-[#5865f2] relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/20 p-1 rounded-full hover:bg-black/40 transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Avatar positioned over banner */}
        <div className="px-4 pb-4 -mt-8 relative">
          <div className="p-1 rounded-full inline-block mb-1.5 bg-[#232428]">
            <Avatar
              src={user.avatar}
              name={user.username}
              status={user.status || "offline"}
              size="lg"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-[#f2f3f5]">
                {user.username}
              </h3>
              {role && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/30">
                  {role}
                </span>
              )}
            </div>
            <p className="text-xs text-[#949ba4]">{user.email}</p>
          </div>

          {user.customStatus && (
            <div className="mt-2.5 text-xs p-2 rounded bg-[#1e1f22] text-[#dbdee1] border border-[#1f2023]">
              💬 "{user.customStatus}"
            </div>
          )}

          {user.bio && (
            <div className="mt-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#949ba4] mb-1">
                About Me
              </div>
              <p className="text-xs whitespace-pre-wrap text-[#dbdee1]">
                {user.bio}
              </p>
            </div>
          )}

          {onDirectMessage && (
            <div className="mt-4 pt-3 border-t border-[#35363c]">
              <button
                onClick={() => {
                  onDirectMessage(user);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-xs font-semibold transition cursor-pointer"
              >
                <MessageSquare size={14} />
                Send Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
