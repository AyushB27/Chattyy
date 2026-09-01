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
      className="min-h-screen flex items-center justify-center p-4 select-none relative"
      style={{ backgroundColor: "#1e1f22" }}
    >
      {/* Theme Toggle in top-right */}
      <button
        onClick={cycleTheme}
        className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#35363c] text-xs font-medium text-[#949ba4] hover:text-[#f2f3f5] hover:bg-[#35373c] transition cursor-pointer"
      >
        <Palette size={14} className="text-[#5865f2]" />
        <span className="capitalize">{theme}</span>
      </button>

      {/* Auth Card */}
      <div
        className="w-full max-w-md rounded-lg shadow-xl p-8 border animate-in fade-in duration-100"
        style={{
          backgroundColor: "#313338",
          borderColor: "#1f2023",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[#5865f2] rounded-full flex items-center justify-center text-white shadow-md mb-3">
            <MessageSquare size={24} />
          </div>
          <h1 className="text-xl font-bold text-[#f2f3f5]">
            {isLogin ? "Welcome back!" : "Create an account"}
          </h1>
          <p className="text-xs text-[#949ba4] mt-1">
            {isLogin
              ? "We're so excited to see you again!"
              : "Start chatting with friends and community servers."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-[#f23f43]/10 border border-[#f23f43]/50 text-[#f23f43] text-xs p-2.5 rounded text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
              EMAIL <span className="text-[#f23f43]">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
                USERNAME <span className="text-[#f23f43]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
                AVATAR IMAGE URL (OPTIONAL)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
              PASSWORD <span className="text-[#f23f43]">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
                CONFIRM PASSWORD <span className="text-[#f23f43]">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1e1f22] text-[#dbdee1] outline-none text-sm border border-[#1f2023] focus:border-[#5865f2]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded font-semibold text-sm transition disabled:opacity-50 cursor-pointer mt-1"
          >
            {loading ? "Please wait..." : isLogin ? "Log In" : "Continue"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-4 text-xs text-[#949ba4]">
          {isLogin ? "Need an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="ml-1 text-[#5865f2] hover:underline font-medium cursor-pointer"
          >
            {isLogin ? "Register" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}