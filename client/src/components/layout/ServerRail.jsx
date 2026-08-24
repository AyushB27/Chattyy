import React from "react";
import { MessageSquare, Plus, Compass, Palette } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ServerRail({
  servers = [],
  activeServer,
  onSelectServer,
  onSelectDMs,
  isDMsActive,
  onOpenCreateServer,
  onOpenJoinServer,
  unreadCount = 0,
}) {
  const { cycleTheme, theme } = useTheme();

  return (
    <div
      className="w-[76px] flex flex-col items-center py-4 select-none flex-shrink-0 h-full overflow-y-auto no-scrollbar space-y-3 border-r"
      style={{
        backgroundColor: "var(--bg-rail)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Direct Messages Button */}
      <div className="relative group flex items-center justify-center w-full">
        {/* Active Pill Indicator */}
        <div
          className={`absolute left-0 w-1.5 rounded-r-full transition-all duration-300 ${
            isDMsActive
              ? "h-10 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              : "h-0 group-hover:h-5 group-hover:bg-gray-400"
          }`}
        />

        <button
          onClick={onSelectDMs}
          className={`relative w-13 h-13 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md ${
            isDMsActive
              ? "bg-indigo-600 rounded-2xl text-white shadow-indigo-500/30"
              : "bg-white/5 text-gray-300 rounded-[22px] group-hover:rounded-2xl group-hover:bg-indigo-600 group-hover:text-white"
          }`}
          title="Direct Messages & Friends"
        >
          <MessageSquare size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#0a0d14] animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Modern Gradient Divider */}
      <div
        className="w-10 h-[2px] rounded-full my-1 opacity-40"
        style={{ backgroundColor: "var(--border-subtle)" }}
      />

      {/* Server List */}
      <div className="flex-1 w-full space-y-3">
        {servers.map((server) => {
          const isActive = activeServer?._id === server._id && !isDMsActive;
          const initials = server.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 3)
            .toUpperCase();

          return (
            <div key={server._id} className="relative group flex items-center justify-center w-full">
              {/* Active Pill Indicator */}
              <div
                className={`absolute left-0 w-1.5 rounded-r-full transition-all duration-300 ${
                  isActive
                    ? "h-10 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                    : "h-0 group-hover:h-5 group-hover:bg-gray-400"
                }`}
              />

              <button
                onClick={() => onSelectServer(server)}
                className={`relative w-13 h-13 flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer shadow-md ${
                  isActive
                    ? "bg-indigo-600 rounded-2xl text-white font-bold shadow-indigo-500/30"
                    : "bg-white/5 text-gray-300 rounded-[22px] group-hover:rounded-2xl group-hover:bg-indigo-600 group-hover:text-white font-semibold"
                }`}
                title={server.name}
              >
                {server.icon ? (
                  <img
                    src={server.icon}
                    alt={server.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-sm tracking-wider">{initials}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Server Button */}
      <div className="relative group flex items-center justify-center w-full">
        <button
          onClick={onOpenCreateServer}
          className="w-13 h-13 bg-white/5 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-[22px] hover:rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md"
          title="Create a Server"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Join Server / Explore Button */}
      <div className="relative group flex items-center justify-center w-full">
        <button
          onClick={onOpenJoinServer}
          className="w-13 h-13 bg-white/5 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-[22px] hover:rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md"
          title="Join a Server with Invite Code"
        >
          <Compass size={24} />
        </button>
      </div>

      {/* Quick Theme Cycle Switcher */}
      <div className="relative group flex items-center justify-center w-full pt-1">
        <button
          onClick={cycleTheme}
          className="w-11 h-11 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition cursor-pointer text-gray-400 hover:text-white border"
          style={{ borderColor: "var(--border-subtle)" }}
          title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
        >
          <Palette size={18} />
        </button>
      </div>
    </div>
  );
}
