import React, { useState, useRef, useEffect } from "react";
import { Smile, Reply, Edit2, Trash2, Check, X, CornerDownRight } from "lucide-react";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";

const quickEmojis = ["👍", "❤️", "🔥", "😂", "🎉", "👀", "✨", "💯"];

const formatTimestamp = (dateString) => {
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

  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
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
          className="my-2 p-3 rounded-xl font-mono text-xs overflow-x-auto border"
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
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
      className="relative group flex items-start gap-3.5 px-4 py-2 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-150 rounded-xl my-0.5"
    >
      {/* Sender Avatar */}
      <Avatar
        src={sender.avatar}
        name={sender.username}
        size="md"
        className="mt-0.5 cursor-pointer transform group-hover:scale-105 transition"
        onClick={() => onUserClick && onUserClick(sender)}
      />

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Reply Quote Banner */}
        {message.replyTo && (
          <div className="flex items-center gap-1.5 text-xs mb-1 opacity-75" style={{ color: "var(--text-muted)" }}>
            <CornerDownRight size={12} className="text-indigo-400" />
            <span className="font-semibold text-indigo-400">
              @{message.replyTo.senderId?.username || "user"}
            </span>
            <span className="truncate italic max-w-xs">
              {message.replyTo.messageContent}
            </span>
          </div>
        )}

        {/* Sender Name & Timestamp */}
        <div className="flex items-baseline gap-2">
          <span
            onClick={() => onUserClick && onUserClick(sender)}
            className="font-bold text-sm hover:underline cursor-pointer tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {sender.username}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {formatTimestamp(message.createdAt || message.timestamp)}
          </span>
          {message.isEdited && (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>(edited)</span>
          )}
        </div>

        {/* Text or Inline Edit */}
        {isEditing ? (
          <div className="mt-1.5 space-y-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
            <div className="text-[11px] flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <span>escape to <button onClick={() => setIsEditing(false)} className="text-indigo-400 hover:underline">cancel</button></span>
              <span>•</span>
              <span>enter to <button onClick={handleSaveEdit} className="text-indigo-400 hover:underline">save</button></span>
            </div>
          </div>
        ) : (
          <div
            className="text-sm mt-0.5 leading-relaxed font-normal"
            style={{ color: "var(--text-primary)" }}
          >
            {renderFormattedContent(messageText)}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.attachments.map((att, idx) => (
              <img
                key={idx}
                src={att.url}
                alt={att.fileName || "attachment"}
                className="max-h-64 rounded-xl object-contain border shadow-sm"
                style={{ borderColor: "var(--border-subtle)" }}
              />
            ))}
          </div>
        )}

        {/* Reactions Pills */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {reactions.map((r, idx) => {
              const hasReacted = r.users?.some(
                (uid) => (uid._id || uid).toString() === user?._id?.toString()
              );
              return (
                <button
                  key={idx}
                  onClick={() => onReact(message._id, r.emoji)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition transform hover:scale-105 cursor-pointer shadow-xs ${
                    hasReacted
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                      : "border-transparent hover:border-gray-500"
                  }`}
                  style={{
                    backgroundColor: hasReacted ? undefined : "var(--bg-card)",
                    borderColor: hasReacted ? undefined : "var(--border-subtle)",
                    color: hasReacted ? undefined : "var(--text-secondary)",
                  }}
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
      <div
        className="absolute top-1 right-4 hidden group-hover:flex items-center border rounded-xl shadow-xl overflow-visible z-20 backdrop-blur-md"
        style={{
          backgroundColor: "var(--bg-popover)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Reaction Emoji Picker */}
        <div className="relative" ref={emojiButtonRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-amber-400 hover:bg-white/10 rounded-l-xl transition cursor-pointer"
            title="Add Reaction"
          >
            <Smile size={16} />
          </button>

          {showEmojiPicker && (
            <div
              className="absolute right-0 bottom-10 z-50 p-2 flex gap-1 rounded-xl shadow-2xl border backdrop-blur-md animate-in zoom-in-95 duration-100"
              style={{
                backgroundColor: "var(--bg-popover)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onReact(message._id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-lg transition transform hover:scale-125 cursor-pointer select-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply Button */}
        <button
          onClick={() => onReply(message)}
          className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-white/10 transition cursor-pointer"
          title="Reply"
        >
          <Reply size={16} />
        </button>

        {/* Edit Button */}
        {isAuthor && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-white/10 transition cursor-pointer"
            title="Edit Message"
          >
            <Edit2 size={16} />
          </button>
        )}

        {/* Delete Button */}
        {(isAuthor || canDelete) && (
          <button
            onClick={() => onDelete(message._id)}
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-r-xl transition cursor-pointer"
            title="Delete Message"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
