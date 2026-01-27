import { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  const url = isLogin
    ? "http://localhost:5000/api/auth/login"
    : "http://localhost:5000/api/auth/register";

  try {
    const res = await axios.post(url, { email, password });

    console.log(res.data);

    if (isLogin && res.data.token) {
      localStorage.setItem("token", res.data.token);
      navigate("/chat");
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338] px-4">

      {/* Card */}
      <div className="w-full max-w-md bg-[#2b2d31] rounded-lg shadow-lg p-6">

        {/* Header */}
        <h1 className="text-2xl font-semibold text-white text-center">
          {isLogin ? "Welcome back!" : "Create an account"}
        </h1>

        <p className="text-gray-400 text-sm text-center mt-1">
          {isLogin
            ? "We’re excited to see you again."
            : "Join and start chatting instantly."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              EMAIL
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                CONFIRM PASSWORD
              </label>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1e1f22] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded font-medium transition"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-sm text-gray-400 text-center mt-4">
          {isLogin ? "Need an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-indigo-400 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
