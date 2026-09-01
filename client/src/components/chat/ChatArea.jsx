import React, { useState, useRef, useEffect } from "react";
import { Hash, AtSign, Users, Menu } from "lucide-react";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import Avatar from "../common/Avatar";
import { useSocket } from "../../context/SocketContext";

// Helper to test if two messages should be grouped as consecutive
const isMessageConsecutive = (currentMsg, prevMsg) => {
  if (!prevMsg || !currentMsg) return false;

  const currentSenderId =
    currentMsg.senderId?._id?.toString() ||
    currentMsg.senderId?.toString() ||
    currentMsg.from;
  const prevSenderId =
    prevMsg.senderId?._id?.toString() ||
    prevMsg.senderId?.toString() ||
    prevMsg.from;

  if (currentSenderId !== prevSenderId) return false;

  // Don't group if current message is a reply
  if (currentMsg.replyTo) return false;

  const currentTime = new Date(currentMsg.createdAt || currentMsg.timestamp).getTime();
  const prevTime = new Date(prevMsg.createdAt || prevMsg.timestamp).getTime();

  // Group if sent within 5 minutes (300,000 ms)
  return currentTime - prevTime < 300000;
};

// Helper for date divider labels
const getDateDivider = (currentMsg, prevMsg) => {
  const currentDate = new Date(currentMsg.createdAt || currentMsg.timestamp).toDateString();
  const prevDate = prevMsg
    ? new Date(prevMsg.createdAt || prevMsg.timestamp).toDateString()
    : null;

  if (currentDate === prevDate) return null;

  const now = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (currentDate === now) return "Today";
  if (currentDate === yesterday) return "Yesterday";
  return new Date(currentMsg.createdAt || currentMsg.timestamp).toLocaleDateString(
    [],
    { month: "long", day: "numeric", year: "numeric" }
  );
};

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
  onToggleMobileSidebar,
  canDelete = false,
}) {
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const { typingMap, emitTyping, stopTyping, userStatuses } = useSocket();

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

  const liveFriendStatus = friend
    ? userStatuses[friend._id] || friend.status || "offline"
    : null;

  return (
    <main
      aria-label="Chat conversation"
      className="flex-1 flex flex-col h-full min-w-0"
      style={{ backgroundColor: "var(--bg-chat)" }}
    >
      {/* ===== CHAT HEADER (48px) ===== */}
      <div
        className="h-12 border-b px-4 flex items-center justify-between shadow-xs z-10 flex-shrink-0"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-chat)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 -ml-1.5 text-[#949ba4] hover:text-[#f2f3f5] rounded transition cursor-pointer"
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>

          {isDM ? (
            <>
              <AtSign size={20} className="text-[#80848e] flex-shrink-0" />
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-sm truncate text-[#f2f3f5]">
                  {friend?.username || "Friend"}
                </span>
                <span className="text-[11px] text-[#949ba4] truncate">
                  ({liveFriendStatus})
                </span>
              </div>
            </>
          ) : (
            <>
              <Hash size={20} className="text-[#80848e] flex-shrink-0" />
              <span className="font-semibold text-sm truncate text-[#f2f3f5]">
                {channel?.name || "general"}
              </span>
              {channel?.topic && (
                <>
                  <div className="w-[1px] h-4 mx-2 bg-[#4e5058]" />
                  <span className="text-xs truncate hidden md:inline text-[#949ba4] font-normal">
                    {channel.topic}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {!isDM && (
            <button
              onClick={onToggleMemberList}
              className={`p-1.5 rounded transition cursor-pointer ${
                isMemberListOpen
                  ? "text-[#f2f3f5] bg-[#35373c]"
                  : "text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#35373c]"
              }`}
              title="Toggle Member List"
            >
              <Users size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ===== MESSAGE STREAM FEED ===== */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-0.5">
        {/* Welcome Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="w-16 h-16 rounded-full bg-[#2b2d31] flex items-center justify-center mb-2">
            {isDM ? (
              <Avatar
                src={friend?.avatar}
                name={friend?.username}
                status={liveFriendStatus}
                size="lg"
              />
            ) : (
              <Hash size={36} className="text-[#f2f3f5]" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-[#f2f3f5] tracking-tight">
            {isDM
              ? friend?.username
              : `Welcome to #${channel?.name || "channel"}!`}
          </h2>
          <p className="text-xs text-[#949ba4] mt-1 leading-relaxed">
            {isDM
              ? `This is the beginning of your direct message history with ${friend?.username}.`
              : channel?.topic ||
                `This is the start of the #${channel?.name || "general"} channel.`}
          </p>
          <hr className="mt-4 border-[#35363c]" />
        </div>

        {/* Message Items Stream */}
        {messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const dateDivider = getDateDivider(msg, prevMsg);
          const isConsecutive = isMessageConsecutive(msg, prevMsg);

          return (
            <React.Fragment key={msg._id || index}>
              {/* Date Divider */}
              {dateDivider && (
                <div className="relative flex items-center justify-center my-4 select-none px-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#35363c]" />
                  </div>
                  <span className="relative px-2 bg-[#313338] text-[11px] font-semibold text-[#949ba4] uppercase tracking-wider">
                    {dateDivider}
                  </span>
                </div>
              )}

              <MessageItem
                message={msg}
                isConsecutive={isConsecutive}
                onReply={(m) => setReplyingTo(m)}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onReact={onReactMessage}
                onUserClick={onUserClick}
                canDelete={canDelete}
              />
            </React.Fragment>
          );
        })}

        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== TYPING INDICATOR (20px) ===== */}
      <div className="h-5 px-4 text-xs text-[#949ba4] flex items-center gap-1.5 flex-shrink-0 select-none">
        {currentTypingUsers.length > 0 && (
          <div className="flex items-center gap-1 animate-pulse">
            <span className="font-semibold text-[#f2f3f5]">
              {currentTypingUsers.join(", ")}
            </span>
            <span>
              {currentTypingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}
      </div>

      {/* ===== CHAT COMPOSER ===== */}
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
    </main>
  );
}
