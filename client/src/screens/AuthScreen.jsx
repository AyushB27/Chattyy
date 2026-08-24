import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MessageSquare, Palette } from "lucide-react";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { cycleTheme, theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      return setError("Passwords do not match!");
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email.trim(), password);
        navigate("/chat");
      } else {
        await register(
          email.trim(),
          username.trim(),
          password,
          avatar.trim()
        );
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 select-none relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-rail)" }}
    >
      {/* Background Glow Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle in top-right */}
      <button
        onClick={cycleTheme}
        className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
        style={{
          borderColor: "var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
      >
        <Palette size={14} className="text-indigo-400" />
        <span className="capitalize">{theme}</span>
      </button>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl p-8 border relative z-10 animate-in fade-in duration-200"
        style={{
          backgroundColor: "var(--bg-popover)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-3">
            <MessageSquare size={32} />
          </div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {isLogin ? "Welcome back to Chatty" : "Create your Chatty Account"}
          </h1>
          <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
            {isLogin
              ? "We're so excited to see you again!"
              : "Hang out with friends, join servers, and chat in real-time."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/50 text-rose-400 text-xs p-3 rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-[11px] font-black uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              EMAIL ADDRESS <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition font-medium"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {!isLogin && (
            <div>
              <label
                className="block text-[11px] font-black uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                USERNAME <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="AwesomeUser"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition font-medium"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label
                className="block text-[11px] font-black uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                AVATAR IMAGE URL (OPTIONAL)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition font-medium"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          )}

          <div>
            <label
              className="block text-[11px] font-black uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              PASSWORD <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition font-medium"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {!isLogin && (
            <div>
              <label
                className="block text-[11px] font-black uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                CONFIRM PASSWORD <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm border focus:ring-2 focus:ring-indigo-500 transition font-medium"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/25 mt-2"
          >
            {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-5 text-xs text-center" style={{ color: "var(--text-muted)" }}>
          {isLogin ? "Need an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="ml-1.5 text-indigo-400 hover:underline font-bold cursor-pointer"
          >
            {isLogin ? "Register" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}