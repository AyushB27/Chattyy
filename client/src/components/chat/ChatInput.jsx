import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  Smile,
  Send,
  X,
  CornerDownRight,
  Sparkles,
} from "lucide-react";

const emojiCategories = {
  Reactions: ["🔥", "❤️", "👍", "👏", "🎉", "✨", "💯", "🙌", "👀", "🚀"],
  Smileys: ["😀", "😂", "🤣", "😍", "😎", "🥳", "🤔", "🥺", "😴", "🤯"],
  Gaming: ["🎮", "👾", "🏆", "⚔️", "🕹️", "🎯", "⚡", "💎", "🛡️", "👑"],
  Food: ["☕", "🍕", "🍔", "🍿", "🍩", "🍟", "🌮", "🍦", "🍪", "🥤"],
};

export default function ChatInput({
  placeholder = "Send a message...",
  onSendMessage,
  replyingTo,
  onCancelReply,
  onTyping,
}) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Reactions");
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachments, setAttachments] = useState([]);

  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
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

  useEffect(() => {
    inputRef.current?.focus();
  }, [replyingTo]);

  const handleChange = (e) => {
    setText(e.target.value);

    // Typing debounce
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;

    if (onTyping) onTyping(false);

    onSendMessage({
      text: text.trim(),
      replyTo: replyingTo?._id || null,
      attachments,
    });

    setText("");
    setAttachments([]);
    setShowEmojiPicker(false);
    if (onCancelReply) onCancelReply();
  };

  const handleInsertEmoji = (emoji) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || text.length;
      const end = input.selectionEnd || text.length;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setText(newText);

      // Restore cursor position right after the inserted emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setText((prev) => prev + emoji);
    }
  };

  const handleAddAttachment = () => {
    if (attachmentUrl.trim()) {
      setAttachments((prev) => [
        ...prev,
        { url: attachmentUrl.trim(), fileType: "image" },
      ]);
      setAttachmentUrl("");
      setShowAttachmentModal(false);
    }
  };

  return (
    <div className="p-4 relative" style={{ backgroundColor: "var(--bg-chat)" }}>
      {/* Reply Banner */}
      {replyingTo && (
        <div
          className="flex items-center justify-between px-3 py-1.5 rounded-t-xl border-t border-x text-xs"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-center gap-1.5 truncate">
            <CornerDownRight size={14} className="text-indigo-400" />
            <span>Replying to</span>
            <span className="font-semibold text-indigo-400">
              @{replyingTo.senderId?.username || replyingTo.from?.split("@")[0] || "user"}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-white p-0.5 rounded transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div
          className="flex gap-2 p-2.5 rounded-t-xl"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group">
              <img
                src={att.url}
                alt="attachment"
                className="w-16 h-16 object-cover rounded-lg border"
                style={{ borderColor: "var(--border-subtle)" }}
              />
              <button
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div
        className={`flex items-center gap-2.5 px-4 py-3 border shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 ${
          replyingTo || attachments.length > 0 ? "rounded-b-2xl" : "rounded-2xl"
        }`}
        style={{
          backgroundColor: "var(--bg-input)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => setShowAttachmentModal(!showAttachmentModal)}
          className="text-gray-400 hover:text-indigo-400 transition cursor-pointer flex-shrink-0"
          title="Add Attachment"
        >
          <PlusCircle size={22} />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        />

        {/* Emoji Button & Popover */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`transition cursor-pointer flex-shrink-0 p-1 rounded-lg ${
              showEmojiPicker ? "text-amber-400 bg-amber-400/10" : "text-gray-400 hover:text-amber-400"
            }`}
            title="Emoji Picker"
          >
            <Smile size={22} />
          </button>

          {/* Categorized Emoji Tray */}
          {showEmojiPicker && (
            <div
              className="absolute right-0 bottom-12 z-50 w-72 rounded-2xl p-3 shadow-2xl border animate-in zoom-in-95 duration-100 backdrop-blur-md"
              style={{
                backgroundColor: "var(--bg-popover)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {/* Category Tabs */}
              <div className="flex justify-between border-b pb-2 mb-2" style={{ borderColor: "var(--border-subtle)" }}>
                {Object.keys(emojiCategories).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                      activeCategory === cat
                        ? "bg-indigo-500 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                {emojiCategories[activeCategory].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertEmoji(emoji)}
                    className="p-2 hover:bg-white/10 rounded-xl text-xl flex items-center justify-center transition transform hover:scale-125 cursor-pointer select-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() && attachments.length === 0}
          className="p-2 rounded-xl text-white font-semibold transition disabled:opacity-30 cursor-pointer shadow-md flex-shrink-0"
          style={{ backgroundColor: "var(--accent)" }}
          title="Send"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Quick Attachment URL Modal */}
      {showAttachmentModal && (
        <div
          className="absolute left-4 bottom-20 z-50 rounded-2xl p-4 shadow-2xl w-80 border animate-in zoom-in-95 duration-100"
          style={{
            backgroundColor: "var(--bg-popover)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
              Attach Image URL
            </span>
            <button
              onClick={() => setShowAttachmentModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none border"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              className="px-3 py-1.5 text-white rounded-lg text-xs font-semibold cursor-pointer shadow"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
