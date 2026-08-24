import React, { useState } from "react";
import {
  Users,
  Plus,
  Hash,
  Volume2,
  ChevronDown,
  UserPlus,
  Settings,
  Trash2,
  LogOut,
  Mic,
  MicOff,
  Headphones,
  PhoneOff,
  Radio,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

export default function Sidebar({
  isDMsActive,
  activeServer,
  activeChannel,
  onSelectChannel,
  friends = [],
  conversations = [],
  requestsCount = 0,
  activeFriend,
  onSelectFriend,
  onSelectFriendsTab,
  isFriendsTabActive,
  onOpenCreateChannel,
  onOpenInviteModal,
  onOpenSettings,
  onLeaveOrDeleteServer,
}) {
  const { user } = useAuth();
  const {
    userStatuses,
    activeVoiceChannel,
    voiceUsers,
    isMuted,
    isDeafened,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
  } = useSocket();

  const [serverMenuOpen, setServerMenuOpen] = useState(false);

  // Group channels by category for server view
  const categories = {};
  if (activeServer && activeServer.channels) {
    activeServer.channels.forEach((channel) => {
      const cat = channel.category || (channel.type === "voice" ? "VOICE CHANNELS" : "TEXT CHANNELS");
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(channel);
    });
  }

  const isOwner = activeServer?.ownerId === user?._id;

  // Build unified DM list: combine conversations and friends
  const dmUsersMap = new Map();

  // Add all recent conversation partners
  conversations.forEach((conv) => {
    if (conv.user && conv.user._id) {
      dmUsersMap.set(conv.user._id.toString(), {
        ...conv.user,
        lastMessage: conv.lastMessage?.text || "",
      });
    }
  });

  // Add friends who may not have messaged yet
  friends.forEach((friend) => {
    if (friend && friend._id && !dmUsersMap.has(friend._id.toString())) {
      dmUsersMap.set(friend._id.toString(), {
        ...friend,
        lastMessage: friend.customStatus || "",
      });
    }
  });

  // If currently chatting with a non-friend, ensure they appear in the list
  if (activeFriend && activeFriend._id && !dmUsersMap.has(activeFriend._id.toString())) {
    dmUsersMap.set(activeFriend._id.toString(), {
      ...activeFriend,
      lastMessage: "",
    });
  }

  const dmUsersList = Array.from(dmUsersMap.values());

  return (
    <div
      className="w-64 flex flex-col h-full select-none flex-shrink-0 border-r"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* ===== SIDEBAR HEADER ===== */}
      {isDMsActive ? (
        <div
          className="h-14 px-3 border-b flex items-center shadow-xs"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={onSelectFriendsTab}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              isFriendsTabActive && !activeFriend
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "hover:bg-white/5"
            }`}
            style={{
              color: isFriendsTabActive && !activeFriend ? "#ffffff" : "var(--text-primary)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <Users size={18} />
              <span>Friends Portal</span>
            </div>
            {requestsCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
                {requestsCount}
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setServerMenuOpen(!serverMenuOpen)}
            className="w-full h-14 px-4 border-b flex items-center justify-between font-bold text-sm hover:bg-white/5 transition cursor-pointer"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          >
            <span className="truncate tracking-tight font-extrabold">{activeServer?.name || "Server"}</span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${serverMenuOpen ? "rotate-180 text-indigo-400" : ""}`}
              style={{ color: "var(--text-muted)" }}
            />
          </button>

          {/* Server Options Dropdown */}
          {serverMenuOpen && (
            <div
              className="absolute top-15 left-2 right-2 z-50 rounded-2xl shadow-2xl p-2 text-xs space-y-1 border animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl"
              style={{
                backgroundColor: "var(--bg-popover)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <button
                onClick={() => {
                  setServerMenuOpen(false);
                  onOpenInviteModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-indigo-400 hover:bg-indigo-600 hover:text-white font-semibold transition cursor-pointer"
              >
                <span>Invite People</span>
                <UserPlus size={15} />
              </button>

              <button
                onClick={() => {
                  setServerMenuOpen(false);
                  onOpenCreateChannel();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 font-semibold transition cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                <span>Create Channel</span>
                <Plus size={15} />
              </button>

              <hr style={{ borderColor: "var(--border-subtle)" }} className="my-1" />

              <button
                onClick={() => {
                  setServerMenuOpen(false);
                  onLeaveOrDeleteServer(activeServer);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-600 hover:text-white font-semibold transition cursor-pointer"
              >
                <span>{isOwner ? "Delete Server" : "Leave Server"}</span>
                {isOwner ? <Trash2 size={15} /> : <LogOut size={15} />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== SIDEBAR BODY LIST ===== */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 no-scrollbar">
        {isDMsActive ? (
          /* DIRECT MESSAGES & ACTIVE THREADS */
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span
                className="text-[11px] font-extrabold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Direct Messages
              </span>
              <button
                onClick={onSelectFriendsTab}
                className="text-gray-400 hover:text-white transition cursor-pointer"
                title="Add Friend"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {dmUsersList.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs opacity-60" style={{ color: "var(--text-muted)" }}>
                  No active conversations yet. Click Friends to start chatting!
                </div>
              ) : (
                dmUsersList.map((targetUser) => {
                  const isActive = activeFriend?._id === targetUser._id;
                  const liveStatus = userStatuses[targetUser._id] || targetUser.status || "offline";

                  return (
                    <button
                      key={targetUser._id}
                      onClick={() => onSelectFriend(targetUser)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                          : "hover:bg-white/5"
                      }`}
                      style={{
                        color: isActive ? "#ffffff" : "var(--text-primary)",
                      }}
                    >
                      <Avatar
                        src={targetUser.avatar}
                        name={targetUser.username}
                        status={liveStatus}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate font-medium">
                          {targetUser.username}
                        </div>
                        {targetUser.lastMessage && (
                          <div
                            className={`text-[11px] truncate ${
                              isActive ? "text-white/80" : ""
                            }`}
                            style={{ color: isActive ? undefined : "var(--text-muted)" }}
                          >
                            {targetUser.lastMessage}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* SERVER CHANNELS LIST */
          <div className="space-y-4">
            {Object.entries(categories).map(([categoryName, channels]) => (
              <div key={categoryName}>
                <div className="flex items-center justify-between px-3 mb-1.5">
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {categoryName}
                  </span>
                  <button
                    onClick={onOpenCreateChannel}
                    className="text-gray-400 hover:text-white transition cursor-pointer"
                    title="Create Channel"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {channels.map((channel) => {
                    const isText = channel.type !== "voice";
                    const isChannelActive = activeChannel?._id === channel._id;
                    const isVoiceActive = activeVoiceChannel?._id === channel._id;

                    return (
                      <div key={channel._id}>
                        <button
                          onClick={() => {
                            if (isText) {
                              onSelectChannel(channel);
                            } else {
                              joinVoiceChannel(channel);
                            }
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer text-left text-sm font-medium ${
                            isChannelActive && isText
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                              : "hover:bg-white/5"
                          }`}
                          style={{
                            color: isChannelActive && isText ? "#ffffff" : "var(--text-secondary)",
                          }}
                        >
                          {isText ? (
                            <Hash size={18} className="flex-shrink-0 opacity-70" />
                          ) : (
                            <Volume2 size={18} className="flex-shrink-0 opacity-70" />
                          )}
                          <span className="truncate">{channel.name}</span>
                        </button>

                        {/* Connected Voice Users with live pulse */}
                        {!isText && isVoiceActive && voiceUsers.length > 0 && (
                          <div
                            className="ml-6 my-1.5 space-y-1.5 border-l-2 pl-2"
                            style={{ borderColor: "var(--accent)" }}
                          >
                            {voiceUsers.map((vUser) => (
                              <div
                                key={vUser.socketId}
                                className="flex items-center gap-2 py-0.5"
                              >
                                <div
                                  className={`relative rounded-full p-0.5 transition ${
                                    vUser.isSpeaking ? "ring-2 ring-emerald-500 ring-offset-1" : ""
                                  }`}
                                >
                                  <Avatar
                                    src={vUser.avatar}
                                    name={vUser.username}
                                    size="xs"
                                  />
                                </div>
                                <span className="text-xs truncate font-medium" style={{ color: "var(--text-primary)" }}>
                                  {vUser.username}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== VOICE STATUS PANEL ===== */}
      {activeVoiceChannel && (
        <div
          className="p-3.5 border-t flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-150"
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Radio size={16} className="animate-pulse" />
            <div>
              <div className="font-bold leading-tight">Voice Connected</div>
              <div className="text-[10px] opacity-75 truncate max-w-[120px]" style={{ color: "var(--text-secondary)" }}>
                {activeVoiceChannel.name}
              </div>
            </div>
          </div>

          <button
            onClick={leaveVoiceChannel}
            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
            title="Disconnect Voice"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      )}

      {/* ===== USER FOOTER (BOTTOM-LEFT) ===== */}
      <div
        className="h-16 px-3 flex items-center justify-between border-t"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* User Profile Card button */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition cursor-pointer flex-1 min-w-0 mr-1"
        >
          <Avatar
            src={user?.avatar}
            name={user?.username}
            status={user?.status || "online"}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {user?.username}
            </div>
            <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
              #{user?.email?.split("@")[0]}
            </div>
          </div>
        </div>

        {/* Audio / Settings Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl hover:bg-white/10 transition cursor-pointer ${
              isMuted ? "text-rose-500 bg-rose-500/10" : "text-gray-400 hover:text-white"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <button
            onClick={toggleDeafen}
            className={`p-2 rounded-xl hover:bg-white/10 transition cursor-pointer ${
              isDeafened ? "text-rose-500 bg-rose-500/10" : "text-gray-400 hover:text-white"
            }`}
            title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
          >
            <Headphones size={16} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="User Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
