import React, { useState, useRef, useEffect } from "react";
import { Hash, AtSign, Users, Palette, Sparkles, MessageSquare } from "lucide-react";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import Avatar from "../common/Avatar";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";

export default function ChatArea({
  isDM = false,
  channel,
  friend,
  messages = [],
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactMessage,
  onUserClick,
  isMemberListOpen,
  onToggleMemberList,
  canDelete = false,
}) {
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const { typingMap, emitTyping, stopTyping, userStatuses } = useSocket();
  const { cycleTheme, theme } = useTheme();

  const typingKey = isDM ? friend?._id : channel?._id;
  const currentTypingUsers = typingMap[typingKey] || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTypingUsers]);

  const handleTyping = (isTyping) => {
    if (!typingKey) return;
    if (isTyping) {
      emitTyping(typingKey, !isDM);
    } else {
      stopTyping(typingKey, !isDM);
    }
  };

  const liveFriendStatus = friend ? (userStatuses[friend._id] || friend.status || "offline") : null;

  return (
    <div
      className="flex-1 flex flex-col h-full min-w-0"
      style={{ backgroundColor: "var(--bg-chat)" }}
    >
      {/* ===== CHAT HEADER ===== */}
      <div
        className="h-14 border-b px-5 flex items-center justify-between shadow-xs z-10 flex-shrink-0 backdrop-blur-md"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-chat)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isDM ? (
            <>
              <AtSign size={20} className="text-indigo-400 flex-shrink-0" />
              <div className="flex items-center gap-2 truncate">
                <span className="font-extrabold text-base truncate tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {friend?.username || "Friend"}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5" style={{ color: "var(--text-muted)" }}>
                  {liveFriendStatus}
                </span>
              </div>
            </>
          ) : (
            <>
              <Hash size={20} className="text-indigo-400 flex-shrink-0" />
              <span className="font-extrabold text-base truncate tracking-tight" style={{ color: "var(--text-primary)" }}>
                {channel?.name || "general"}
              </span>
              {channel?.topic && (
                <>
                  <div className="w-[1px] h-4 mx-1" style={{ backgroundColor: "var(--border-subtle)" }} />
                  <span className="text-xs truncate hidden md:inline font-medium" style={{ color: "var(--text-muted)" }}>
                    {channel.topic}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Header Action Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
            title={`Current Theme: ${theme.toUpperCase()} (Click to toggle)`}
          >
            <Palette size={14} className="text-indigo-400" />
            <span className="capitalize">{theme}</span>
          </button>

          {!isDM && (
            <button
              onClick={onToggleMemberList}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isMemberListOpen ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}
              style={{
                borderColor: "var(--border-subtle)",
              }}
              title="Toggle Server Member List"
            >
              <Users size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ===== MESSAGES FEED ===== */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Welcome Banner Card */}
        <div className="px-4 pt-6 pb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg border"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
            }}
          >
            {isDM ? (
              <Avatar
                src={friend?.avatar}
                name={friend?.username}
                status={liveFriendStatus}
                size="lg"
              />
            ) : (
              <Hash size={32} className="text-indigo-400" />
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            {isDM
              ? friend?.username
              : `Welcome to #${channel?.name || "channel"}!`}
          </h2>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {isDM
              ? `This is the direct message channel with @${friend?.username}. Send messages, files, and reactions in real-time.`
              : channel?.topic || `This is the beginning of the #${channel?.name || "general"} channel.`}
          </p>
          <hr className="mt-4 opacity-30" style={{ borderColor: "var(--border-subtle)" }} />
        </div>

        {/* Message Items */}
        {messages.map((msg, index) => (
          <MessageItem
            key={msg._id || index}
            message={msg}
            onReply={(m) => setReplyingTo(m)}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            onReact={onReactMessage}
            onUserClick={onUserClick}
            canDelete={canDelete}
          />
        ))}

        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== TYPING INDICATOR ===== */}
      <div className="h-5 px-6 text-xs flex items-center gap-1.5 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
        {currentTypingUsers.length > 0 && (
          <div className="flex items-center gap-1.5 animate-pulse font-medium">
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              {currentTypingUsers.join(", ")}
            </span>
            <span>
              {currentTypingUsers.length === 1 ? "is typing..." : "are typing..."}
            </span>
          </div>
        )}
      </div>

      {/* ===== CHAT INPUT BAR ===== */}
      <ChatInput
        placeholder={
          isDM
            ? `Message @${friend?.username || "friend"}`
            : `Message #${channel?.name || "channel"}`
        }
        onSendMessage={onSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onTyping={handleTyping}
      />
    </div>
  );
}
