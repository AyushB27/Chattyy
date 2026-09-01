import React, { useState } from "react";
import { X, LogOut, User, Check, Palette } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../common/Avatar";

const statusOptions = [
  { id: "online", label: "Online", color: "bg-[#23a55a]" },
  { id: "idle", label: "Idle", color: "bg-[#f0b232]" },
  { id: "dnd", label: "Do Not Disturb", color: "bg-[#f23f43]" },
  { id: "offline", label: "Invisible", color: "bg-[#80848e]" },
];

export default function UserSettingsModal({ isOpen, onClose }) {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const [username, setUsername] = useState(user?.username || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [customStatus, setCustomStatus] = useState(user?.customStatus || "");
  const [status, setStatus] = useState(user?.status || "online");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSavedSuccess(false);

    try {
      await updateProfile({
        username: username.trim(),
        avatar: avatar.trim(),
        bio: bio.trim(),
        customStatus: customStatus.trim(),
        status,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-100">
      <div
        className="relative w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden border flex flex-col md:flex-row h-[540px]"
        style={{
          backgroundColor: "#313338",
          borderColor: "#1f2023",
        }}
      >
        {/* Left Nav */}
        <div
          className="w-full md:w-52 p-4 flex flex-col justify-between border-r"
          style={{
            backgroundColor: "#2b2d31",
            borderColor: "#1f2023",
          }}
        >
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] px-2">
              User Settings
            </div>
            <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded bg-[#404249] text-white text-sm font-medium">
              <User size={16} />
              My Account
            </button>

            {/* Theme Selector Section */}
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] px-2 mb-1.5 flex items-center gap-1.5">
                <Palette size={12} />
                App Theme
              </div>
              <div className="grid grid-cols-2 gap-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium border transition cursor-pointer ${
                      theme === t.id
                        ? "bg-[#5865f2] border-[#5865f2] text-white"
                        : "border-transparent text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span className="truncate">{t.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <hr className="border-[#35363c] my-2" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-[#f23f43] hover:bg-[#f23f43]/10 text-sm font-medium transition cursor-pointer"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>

        {/* Right Form Content */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#949ba4] hover:text-[#f2f3f5] p-1 rounded transition cursor-pointer"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold text-[#f2f3f5] mb-1">
            My Profile
          </h2>
          <p className="text-xs text-[#949ba4] mb-4">
            Manage your avatar, presence status, and account bio.
          </p>

          {error && (
            <div className="mb-3 p-2 bg-[#f23f43]/10 border border-[#f23f43]/50 rounded text-[#f23f43] text-xs">
              {error}
            </div>
          )}

          {savedSuccess && (
            <div className="mb-3 p-2 bg-[#23a55a]/10 border border-[#23a55a]/50 rounded text-[#23a55a] text-xs flex items-center gap-1.5 font-medium">
              <Check size={14} /> Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 flex-1">
            {/* Avatar preview and input */}
            <div className="flex items-center gap-4 p-3 rounded bg-[#2b2d31] border border-[#1f2023]">
              <Avatar
                src={avatar || user.avatar}
                name={username || user.username}
                status={status}
                size="lg"
              />
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1">
                  AVATAR IMAGE URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded text-xs outline-none bg-[#1e1f22] text-[#dbdee1] border border-[#1f2023] focus:border-[#5865f2]"
                />
              </div>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-1.5 rounded text-sm outline-none bg-[#1e1f22] text-[#dbdee1] border border-[#1f2023] focus:border-[#5865f2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-1.5 rounded text-sm outline-none bg-[#1e1f22] text-[#80848e] border border-[#1f2023] cursor-not-allowed opacity-70"
                />
              </div>
            </div>

            {/* Custom Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1">
                Custom Status
              </label>
              <input
                type="text"
                placeholder="What's on your mind?"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-1.5 rounded text-sm outline-none bg-[#1e1f22] text-[#dbdee1] border border-[#1f2023] focus:border-[#5865f2]"
              />
            </div>

            {/* Online Presence */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
                Online Presence
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition text-xs font-medium ${
                      status === opt.id
                        ? "border-[#5865f2] bg-[#2b2d31] text-[#f2f3f5]"
                        : "border-[#1f2023] bg-[#1e1f22] text-[#949ba4] hover:bg-[#2b2d31]"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1">
                About Me
              </label>
              <textarea
                rows={2}
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-1.5 rounded text-sm outline-none bg-[#1e1f22] text-[#dbdee1] border border-[#1f2023] focus:border-[#5865f2] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[#35363c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#f2f3f5] hover:underline cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
