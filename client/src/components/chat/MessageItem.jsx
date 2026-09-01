import React, { useState, useRef, useEffect } from "react";
import { Smile, Reply, Edit2, Trash2, CornerDownRight } from "lucide-react";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";

const quickEmojis = ["👍", "❤️", "🔥", "😂", "🎉", "👀", "✨", "💯"];

const formatFullTimestamp = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) return `Today at ${timeStr}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeStr}`;
  }

  return `${date.toLocaleDateString([], { month: "2-digit", day: "2-digit", year: "numeric" })} ${timeStr}`;
};

const formatGutterTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const renderFormattedContent = (content = "") => {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const code = part.slice(3, -3);
      return (
        <pre
          key={index}
          className="my-1.5 p-3 rounded bg-[#1e1f22] text-[#57f287] font-mono text-xs overflow-x-auto border border-[#232428]"
        >
          <code>{code}</code>
        </pre>
      );
    }

    return (
      <span key={index} className="whitespace-pre-wrap break-words">
        {part}
      </span>
    );
  });
};

export default function MessageItem({
  message,
  isConsecutive = false,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onUserClick,
  canDelete = false,
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.messageContent || message.text || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showEmojiPicker]);

  const sender = message.senderId || {
    _id: message.from,
    username: message.from?.split("@")[0] || "User",
    avatar: "",
  };

  const isAuthor =
    (sender._id && user?._id && sender._id.toString() === user._id.toString()) ||
    message.from === user?.email;
  const messageText = message.messageContent || message.text || "";
  const reactions = message.reactions || [];

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== messageText) {
      onEdit(message._id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`relative group flex items-start px-4 hover:bg-[#2e3035] transition-colors ${
        isConsecutive ? "py-0.5 mt-0" : "py-1.5 mt-3"
      }`}
    >
      {/* Reply Quote Banner */}
      {!isConsecutive && message.replyTo && (
        <div className="absolute -top-3.5 left-14 flex items-center gap-1.5 text-xs text-[#949ba4] select-none">
          <CornerDownRight size={12} className="text-[#80848e]" />
          <span className="font-semibold text-[#5865f2]">
            @{message.replyTo.senderId?.username || "user"}
          </span>
          <span className="truncate italic text-[#949ba4] max-w-xs">
            {message.replyTo.messageContent}
          </span>
        </div>
      )}

      {/* Left Column: Avatar or Hover Timestamp */}
      <div className="w-10 flex-shrink-0 mr-4 flex items-start justify-center">
        {isConsecutive ? (
          <span className="text-[10px] text-[#949ba4] opacity-0 group-hover:opacity-100 select-none pt-0.5">
            {formatGutterTime(message.createdAt || message.timestamp)}
          </span>
        ) : (
          <Avatar
            src={sender.avatar}
            name={sender.username}
            size="md"
            className="cursor-pointer"
            onClick={() => onUserClick && onUserClick(sender)}
          />
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {!isConsecutive && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span
              onClick={() => onUserClick && onUserClick(sender)}
              className="font-medium text-sm text-[#f2f3f5] hover:underline cursor-pointer"
            >
              {sender.username}
            </span>
            <span className="text-[11px] text-[#949ba4]">
              {formatFullTimestamp(message.createdAt || message.timestamp)}
            </span>
            {message.isEdited && (
              <span className="text-[10px] text-[#949ba4]">(edited)</span>
            )}
          </div>
        )}

        {/* Text / Inline Edit */}
        {isEditing ? (
          <div className="mt-1 space-y-1">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-full px-3 py-1.5 rounded bg-[#383a40] text-[#dbdee1] text-sm outline-none border border-[#1f2023] focus:border-[#5865f2]"
              autoFocus
            />
            <div className="text-[11px] text-[#949ba4] flex items-center gap-1.5">
              <span>escape to <button onClick={() => setIsEditing(false)} className="text-[#5865f2] hover:underline">cancel</button></span>
              <span>•</span>
              <span>enter to <button onClick={handleSaveEdit} className="text-[#5865f2] hover:underline">save</button></span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#dbdee1] leading-[1.375rem] break-words">
            {renderFormattedContent(messageText)}
            {isConsecutive && message.isEdited && (
              <span className="text-[10px] text-[#949ba4] ml-1">(edited)</span>
            )}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((att, idx) => (
              <img
                key={idx}
                src={att.url}
                alt={att.fileName || "attachment"}
                className="max-h-72 rounded object-contain border border-[#1f2023]"
              />
            ))}
          </div>
        )}

        {/* Reaction Pills */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {reactions.map((r, idx) => {
              const hasReacted = r.users?.some(
                (uid) => (uid._id || uid).toString() === user?._id?.toString()
              );
              return (
                <button
                  key={idx}
                  onClick={() => onReact(message._id, r.emoji)}
                  className={`flex items-center gap-1.5 h-6 px-2 rounded text-xs font-semibold border transition cursor-pointer ${
                    hasReacted
                      ? "bg-[#5865f2]/20 border-[#5865f2] text-[#c9cdfb]"
                      : "bg-[#2b2d31] border-[#3f4147] text-[#b5bac1] hover:bg-[#35373c] hover:border-[#4e5058]"
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.users?.length || 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Toolbar on Hover */}
      <div className="absolute -top-3.5 right-4 hidden group-hover:flex items-center bg-[#313338] border border-[#232428] rounded shadow-md z-20">
        {/* Emoji Button */}
        <div className="relative" ref={emojiButtonRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-[#b5bac1] hover:text-[#f2f3f5] hover:bg-[#35373c] rounded-l transition cursor-pointer"
            title="Add Reaction"
          >
            <Smile size={16} />
          </button>

          {showEmojiPicker && (
            <div className="absolute right-0 bottom-8 z-30 bg-[#2b2d31] border border-[#1f2023] rounded p-1 flex gap-1 shadow-lg">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onReact(message._id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1 hover:bg-[#35373c] rounded text-base transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply */}
        <button
          onClick={() => onReply(message)}
          className="p-1.5 text-[#b5bac1] hover:text-[#f2f3f5] hover:bg-[#35373c] transition cursor-pointer"
          title="Reply"
        >
          <Reply size={16} />
        </button>

        {/* Edit */}
        {isAuthor && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-[#b5bac1] hover:text-[#f2f3f5] hover:bg-[#35373c] transition cursor-pointer"
            title="Edit Message"
          >
            <Edit2 size={16} />
          </button>
        )}

        {/* Delete */}
        {(isAuthor || canDelete) && (
          <button
            onClick={() => onDelete(message._id)}
            className="p-1.5 text-[#b5bac1] hover:text-[#f23f43] hover:bg-[#35373c] rounded-r transition cursor-pointer"
            title="Delete Message"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
