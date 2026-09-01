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
      const cat =
        channel.category ||
        (channel.type === "voice" ? "VOICE CHANNELS" : "TEXT CHANNELS");
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
  if (
    activeFriend &&
    activeFriend._id &&
    !dmUsersMap.has(activeFriend._id.toString())
  ) {
    dmUsersMap.set(activeFriend._id.toString(), {
      ...activeFriend,
      lastMessage: "",
    });
  }

  const dmUsersList = Array.from(dmUsersMap.values());

  return (
    <aside
      aria-label="Channel and conversation sidebar"
      className="w-60 flex flex-col h-full select-none flex-shrink-0 border-r"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* ===== HEADER (48px) ===== */}
      {isDMsActive ? (
        <div
          className="h-12 px-3 border-b flex items-center shadow-xs"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={onSelectFriendsTab}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-sm font-medium transition cursor-pointer ${
              isFriendsTabActive && !activeFriend
                ? "bg-[#404249] text-white"
                : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} />
              <span>Friends</span>
            </div>
            {requestsCount > 0 && (
              <span className="bg-[#f23f43] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {requestsCount}
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setServerMenuOpen(!serverMenuOpen)}
            className="w-full h-12 px-4 border-b flex items-center justify-between font-semibold text-sm hover:bg-[#35373c] transition cursor-pointer text-[#f2f3f5]"
            style={{
              borderColor: "var(--border-subtle)",
            }}
          >
            <span className="truncate">{activeServer?.name || "Server"}</span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 text-[#949ba4] ${
                serverMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Server Dropdown Menu */}
          {serverMenuOpen && (
            <div
              className="absolute top-13 left-2 right-2 z-50 rounded-md shadow-lg p-1.5 text-xs space-y-0.5 border"
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
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[#5865f2] hover:bg-[#5865f2] hover:text-white font-medium transition cursor-pointer"
              >
                <span>Invite People</span>
                <UserPlus size={14} />
              </button>

              <button
                onClick={() => {
                  setServerMenuOpen(false);
                  onOpenCreateChannel();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[#dbdee1] hover:bg-[#5865f2] hover:text-white font-medium transition cursor-pointer"
              >
                <span>Create Channel</span>
                <Plus size={14} />
              </button>

              <hr
                style={{ borderColor: "var(--border-divider)" }}
                className="my-1"
              />

              <button
                onClick={() => {
                  setServerMenuOpen(false);
                  onLeaveOrDeleteServer(activeServer);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[#f23f43] hover:bg-[#f23f43] hover:text-white font-medium transition cursor-pointer"
              >
                <span>{isOwner ? "Delete Server" : "Leave Server"}</span>
                {isOwner ? <Trash2 size={14} /> : <LogOut size={14} />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== SIDEBAR BODY LIST ===== */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 no-scrollbar">
        {isDMsActive ? (
          /* DIRECT MESSAGES LIST */
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4]">
                Direct Messages
              </span>
              <button
                onClick={onSelectFriendsTab}
                className="text-[#949ba4] hover:text-[#dbdee1] transition cursor-pointer"
                title="Create DM"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-0.5">
              {dmUsersList.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-[#949ba4]">
                  No active conversations
                </div>
              ) : (
                dmUsersList.map((targetUser) => {
                  const isActive = activeFriend?._id === targetUser._id;
                  const liveStatus =
                    userStatuses[targetUser._id] ||
                    targetUser.status ||
                    "offline";

                  return (
                    <button
                      key={targetUser._id}
                      onClick={() => onSelectFriend(targetUser)}
                      className={`w-full flex items-center gap-3 px-2 py-1.5 rounded transition cursor-pointer text-left ${
                        isActive
                          ? "bg-[#404249] text-white"
                          : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
                      }`}
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
                          <div className="text-[11px] truncate text-[#949ba4]">
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
          /* SERVER CHANNELS TREE */
          <div className="space-y-4">
            {Object.entries(categories).map(([categoryName, channels]) => (
              <div key={categoryName}>
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4]">
                    {categoryName}
                  </span>
                  <button
                    onClick={onOpenCreateChannel}
                    className="text-[#949ba4] hover:text-[#dbdee1] transition cursor-pointer"
                    title="Create Channel"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {channels.map((channel) => {
                    const isText = channel.type !== "voice";
                    const isChannelActive = activeChannel?._id === channel._id;
                    const isVoiceActive =
                      activeVoiceChannel?._id === channel._id;

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
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded transition cursor-pointer text-left text-sm font-medium ${
                            isChannelActive && isText
                              ? "bg-[#404249] text-white"
                              : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
                          }`}
                        >
                          {isText ? (
                            <Hash size={18} className="flex-shrink-0" />
                          ) : (
                            <Volume2 size={18} className="flex-shrink-0" />
                          )}
                          <span className="truncate">{channel.name}</span>
                        </button>

                        {/* Connected Voice Users */}
                        {!isText && isVoiceActive && voiceUsers.length > 0 && (
                          <div className="ml-6 my-1 space-y-1 border-l border-[#4e5058] pl-2">
                            {voiceUsers.map((vUser) => (
                              <div
                                key={vUser.socketId}
                                className="flex items-center gap-2 py-0.5"
                              >
                                <div
                                  className={`relative rounded-full ${
                                    vUser.isSpeaking
                                      ? "ring-2 ring-[#23a55a]"
                                      : ""
                                  }`}
                                >
                                  <Avatar
                                    src={vUser.avatar}
                                    name={vUser.username}
                                    size="xs"
                                  />
                                </div>
                                <span className="text-xs truncate font-medium text-[#dbdee1]">
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

      {/* ===== VOICE STATUS BAR (40px) ===== */}
      {activeVoiceChannel && (
        <div
          className="h-11 px-3 border-t flex items-center justify-between text-xs"
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 text-[#23a55a]">
            <Radio size={16} />
            <div>
              <div className="font-bold leading-tight">Voice Connected</div>
              <div className="text-[10px] text-[#949ba4] truncate max-w-[120px]">
                {activeVoiceChannel.name}
              </div>
            </div>
          </div>

          <button
            onClick={leaveVoiceChannel}
            className="p-1.5 text-[#949ba4] hover:text-[#f23f43] hover:bg-black/10 rounded transition cursor-pointer"
            title="Disconnect Voice"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      )}

      {/* ===== USER FOOTER (52px) ===== */}
      <div
        className="h-[52px] px-2 flex items-center justify-between border-t"
        style={{
          backgroundColor: "#232428",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* User Badge */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-[#35373c] transition cursor-pointer flex-1 min-w-0 mr-1"
        >
          <Avatar
            src={user?.avatar}
            name={user?.username}
            status={user?.status || "online"}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#f2f3f5] truncate">
              {user?.username}
            </div>
            <div className="text-[11px] text-[#949ba4] truncate">
              #{user?.email?.split("@")[0]}
            </div>
          </div>
        </div>

        {/* Audio & Settings Buttons */}
        <div className="flex items-center text-[#949ba4]">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded hover:bg-[#35373c] transition cursor-pointer ${
              isMuted ? "text-[#f23f43]" : "hover:text-[#dbdee1]"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <button
            onClick={toggleDeafen}
            className={`p-1.5 rounded hover:bg-[#35373c] transition cursor-pointer ${
              isDeafened ? "text-[#f23f43]" : "hover:text-[#dbdee1]"
            }`}
            title={isDeafened ? "Undeafen" : "Deafen"}
          >
            <Headphones size={16} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded hover:bg-[#35373c] hover:text-[#dbdee1] transition cursor-pointer"
            title="User Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
