import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  Smile,
  Send,
  X,
  CornerDownRight,
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

  // Close emoji picker on outside click
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
    <div className="px-4 pb-6 pt-0 relative select-none">
      {/* Attached Reply Preview Bar */}
      {replyingTo && (
        <div
          className="flex items-center justify-between px-3 py-1.5 rounded-t-lg text-xs"
          style={{
            backgroundColor: "#2b2d31",
            color: "#b5bac1",
          }}
        >
          <div className="flex items-center gap-1.5 truncate">
            <CornerDownRight size={14} className="text-[#5865f2]" />
            <span>Replying to</span>
            <span className="font-semibold text-[#5865f2]">
              @{replyingTo.senderId?.username || replyingTo.from?.split("@")[0] || "user"}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-[#949ba4] hover:text-[#f2f3f5] p-0.5 rounded transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div
          className="flex gap-2 p-2 rounded-t-lg"
          style={{ backgroundColor: "#2b2d31" }}
        >
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group">
              <img
                src={att.url}
                alt="attachment"
                className="w-16 h-16 object-cover rounded border border-[#1f2023]"
              />
              <button
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute -top-1.5 -right-1.5 bg-[#f23f43] text-white rounded-full p-0.5 hover:bg-[#da373c] transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer Input Box */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
          replyingTo || attachments.length > 0 ? "rounded-b-lg" : "rounded-lg"
        }`}
        style={{
          backgroundColor: "#383a40",
        }}
      >
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => setShowAttachmentModal(!showAttachmentModal)}
          className="text-[#b5bac1] hover:text-[#f2f3f5] transition cursor-pointer flex-shrink-0"
          title="Attach Image / URL"
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
          className="flex-1 bg-transparent text-[#dbdee1] placeholder-[#80848e] outline-none text-sm leading-relaxed"
        />

        {/* Emoji Button */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`transition cursor-pointer flex-shrink-0 p-1 rounded ${
              showEmojiPicker ? "text-[#fee75c]" : "text-[#b5bac1] hover:text-[#fee75c]"
            }`}
            title="Add Emoji"
          >
            <Smile size={22} />
          </button>

          {/* Categorized Emoji Tray */}
          {showEmojiPicker && (
            <div
              className="absolute right-0 bottom-12 z-50 w-72 rounded-lg p-3 shadow-xl border animate-in fade-in duration-100"
              style={{
                backgroundColor: "#2b2d31",
                borderColor: "#1f2023",
              }}
            >
              {/* Category Tabs */}
              <div className="flex justify-between border-b border-[#35363c] pb-2 mb-2">
                {Object.keys(emojiCategories).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-2 py-1 rounded font-semibold transition cursor-pointer ${
                      activeCategory === cat
                        ? "bg-[#5865f2] text-white"
                        : "text-[#949ba4] hover:text-[#dbdee1]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto p-1">
                {emojiCategories[activeCategory].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertEmoji(emoji)}
                    className="p-1.5 hover:bg-[#35373c] rounded text-lg flex items-center justify-center transition cursor-pointer select-none"
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
          className="text-[#5865f2] hover:text-[#4752c4] disabled:text-[#4e5058] transition cursor-pointer flex-shrink-0 p-1"
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Attachment URL Modal */}
      {showAttachmentModal && (
        <div
          className="absolute left-4 bottom-20 z-50 rounded-lg p-3 shadow-xl w-80 border animate-in fade-in duration-100"
          style={{
            backgroundColor: "#2b2d31",
            borderColor: "#1f2023",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#949ba4]">
              Attach Image URL
            </span>
            <button
              onClick={() => setShowAttachmentModal(false)}
              className="text-[#949ba4] hover:text-[#f2f3f5]"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded text-xs outline-none bg-[#1e1f22] text-[#dbdee1] border border-[#1f2023] focus:border-[#5865f2]"
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              className="px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-xs font-medium cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
