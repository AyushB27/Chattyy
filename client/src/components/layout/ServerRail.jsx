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
    <nav
      aria-label="Servers navigation"
      className="w-[72px] flex flex-col items-center py-3 select-none flex-shrink-0 h-full overflow-y-auto no-scrollbar space-y-2 border-r"
      style={{
        backgroundColor: "var(--bg-rail)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Direct Messages (Home) Button */}
      <div className="relative group flex items-center justify-center w-full">
        {/* Left Pill Indicator */}
        <div
          className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
            isDMsActive
              ? "h-10 opacity-100"
              : "h-2 group-hover:h-5 opacity-0 group-hover:opacity-100"
          }`}
        />

        <button
          onClick={onSelectDMs}
          className={`relative w-12 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isDMsActive
              ? "bg-[#5865f2] rounded-[16px] text-white"
              : "bg-[#313338] text-[#dbdee1] rounded-[24px] group-hover:rounded-[16px] group-hover:bg-[#5865f2] group-hover:text-white"
          }`}
          title="Direct Messages"
        >
          <MessageSquare size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#f23f43] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full border-2 border-[#1e1f22]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Separator Divider */}
      <div
        className="w-8 h-[2px] rounded-full"
        style={{ backgroundColor: "var(--border-divider)" }}
      />

      {/* Server List */}
      <div className="flex-1 w-full space-y-2">
        {servers.map((server) => {
          const isActive = activeServer?._id === server._id && !isDMsActive;
          const initials = server.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 3)
            .toUpperCase();

          return (
            <div
              key={server._id}
              className="relative group flex items-center justify-center w-full"
            >
              {/* Left Pill Indicator */}
              <div
                className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                  isActive
                    ? "h-10 opacity-100"
                    : "h-2 group-hover:h-5 opacity-0 group-hover:opacity-100"
                }`}
              />

              <button
                onClick={() => onSelectServer(server)}
                className={`relative w-12 h-12 flex items-center justify-center transition-all duration-200 overflow-hidden cursor-pointer ${
                  isActive
                    ? "bg-[#5865f2] rounded-[16px] text-white font-semibold"
                    : "bg-[#313338] text-[#dbdee1] rounded-[24px] group-hover:rounded-[16px] group-hover:bg-[#5865f2] group-hover:text-white font-medium"
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
                  <span className="text-sm tracking-wide">{initials}</span>
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
          className="w-12 h-12 bg-[#313338] hover:bg-[#23a55a] text-[#23a55a] hover:text-white rounded-[24px] hover:rounded-[16px] flex items-center justify-center transition-all duration-200 cursor-pointer"
          title="Add a Server"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Join Server Button */}
      <div className="relative group flex items-center justify-center w-full">
        <button
          onClick={onOpenJoinServer}
          className="w-12 h-12 bg-[#313338] hover:bg-[#5865f2] text-[#5865f2] hover:text-white rounded-[24px] hover:rounded-[16px] flex items-center justify-center transition-all duration-200 cursor-pointer"
          title="Explore / Join a Server"
        >
          <Compass size={22} />
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="relative group flex items-center justify-center w-full pt-1">
        <button
          onClick={cycleTheme}
          className="w-9 h-9 text-[#949ba4] hover:text-[#f2f3f5] hover:bg-[#35373c] rounded-[12px] flex items-center justify-center transition cursor-pointer"
          title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
        >
          <Palette size={16} />
        </button>
      </div>
    </nav>
  );
}
