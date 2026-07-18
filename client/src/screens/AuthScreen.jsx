import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Added username state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // Added error state for UI feedback
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // 1. Password Confirmation Check
    if (!isLogin && password !== confirmPassword) {
      return setError("Passwords do not match!");
    }

    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";

    // 2. Payload adjusts based on login vs register
    const payload = isLogin 
      ? { email, password } 
      : { email, username, password };

    try {
      const res = await axios.post(url, payload);

      if (isLogin && res.data.token) {
        // 3. Save BOTH token and email to localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userEmail", email); 
        navigate("/chat");
      } else {
        // If registration is successful, switch to login screen
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
        alert("Registration successful! Please log in.");
      }
    } catch (err) {
      // Set the error message from the backend to display on the UI
      setError(err.response?.data?.message || err.message);
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

        {/* Error Message Display */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500 text-red-500 text-sm p-2 rounded text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              EMAIL
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                USERNAME
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded bg-[#1e1f22] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="AwesomeUser123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 rounded bg-[#1e1f22] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                required
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
            onClick={() => {
              setIsLogin(!isLogin);
              setError(""); // Clear errors on toggle
            }}
            className="ml-1 text-indigo-400 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}