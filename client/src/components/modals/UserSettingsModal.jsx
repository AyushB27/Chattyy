import React, { useState } from "react";
import { X, LogOut, User, Sparkles, Check, Palette } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../common/Avatar";

const statusOptions = [
  { id: "online", label: "Online", color: "bg-emerald-500", desc: "Visible and active" },
  { id: "idle", label: "Idle", color: "bg-amber-500", desc: "Away from keyboard" },
  { id: "dnd", label: "Do Not Disturb", color: "bg-rose-500", desc: "Mute notifications" },
  { id: "offline", label: "Invisible", color: "bg-gray-500", desc: "Appear offline" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col md:flex-row h-[580px]"
        style={{
          backgroundColor: "var(--bg-popover)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Left Sidebar */}
        <div
          className="w-full md:w-56 p-5 flex flex-col justify-between border-r"
          style={{
            backgroundColor: "var(--bg-sidebar)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="space-y-4">
            <div
              className="text-[11px] font-black uppercase tracking-wider px-2"
              style={{ color: "var(--text-muted)" }}
            >
              User Settings
            </div>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20"
            >
              <User size={16} />
              My Profile
            </button>

            {/* Theme Selector Section */}
            <div className="pt-2">
              <div
                className="text-[11px] font-black uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Palette size={12} />
                App Theme
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      theme === t.id
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                        : "border-transparent hover:bg-white/5"
                    }`}
                    style={{
                      color: theme === t.id ? undefined : "var(--text-secondary)",
                    }}
                  >
                    <span>{t.icon}</span>
                    <span className="truncate">{t.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <hr style={{ borderColor: "var(--border-subtle)" }} className="my-3" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm font-bold transition cursor-pointer"
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
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
            My Account & Profile
          </h2>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
            Customize your avatar, bio, and presence in real-time.
          </p>

          {error && (
            <div className="mb-4 px-3.5 py-2 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          {savedSuccess && (
            <div className="mb-4 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <Check size={14} /> Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 flex-1">
            {/* Avatar preview and input */}
            <div
              className="flex items-center gap-4 p-3.5 rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <Avatar
                src={avatar || user.avatar}
                name={username || user.username}
                status={status}
                size="lg"
              />
              <div className="flex-1">
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  AVATAR IMAGE URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-indigo-500"
                  style={{
                    backgroundColor: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border focus:ring-1 focus:ring-indigo-500"
                  style={{
                    backgroundColor: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2 rounded-xl text-sm outline-none opacity-50 cursor-not-allowed border"
                  style={{
                    backgroundColor: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>

            {/* Custom Status */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Custom Status
              </label>
              <input
                type="text"
                placeholder="What's on your mind? (e.g. Coding with AI)"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border focus:ring-1 focus:ring-indigo-500"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Status Selector */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Online Presence
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border transition text-xs font-semibold ${
                      status === opt.id
                        ? "border-indigo-500 bg-indigo-500/10 text-white"
                        : "border-transparent hover:bg-white/5"
                    }`}
                    style={{
                      backgroundColor: status === opt.id ? undefined : "var(--bg-card)",
                      color: status === opt.id ? "#ffffff" : "var(--text-secondary)",
                    }}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                About Me / Bio
              </label>
              <textarea
                rows={2}
                placeholder="A short bio..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border focus:ring-1 focus:ring-indigo-500 resize-none"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Save */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-400 hover:underline cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer shadow-md"
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
