import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import socket from "../components/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync token and user profile on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await api.get("/api/profile");
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("userEmail", res.data.user.email);
          }
        } catch (err) {
          console.warn("Session check failed:", err.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem("token", receivedToken);
    localStorage.setItem("user", JSON.stringify(receivedUser));
    localStorage.setItem("userEmail", receivedUser.email);

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const register = async (email, username, password, avatar = "") => {
    const res = await api.post("/api/auth/register", {
      email,
      username,
      password,
      avatar,
    });
    const { token: receivedToken, user: receivedUser } = res.data;

    if (receivedToken && receivedUser) {
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(receivedUser));
      localStorage.setItem("userEmail", receivedUser.email);

      setToken(receivedToken);
      setUser(receivedUser);
    }

    return res.data;
  };

  const updateProfile = async (updateData) => {
    const res = await api.patch("/api/profile", updateData);
    if (res.data.user) {
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Notify socket of status or profile change
      socket.emit("user:set_status", {
        status: res.data.user.status,
        customStatus: res.data.user.customStatus,
      });
    }
    return res.data.user;
  };

  const setStatus = async (status) => {
    return updateProfile({ status });
  };

  const logout = () => {
    if (socket.connected) {
      socket.disconnect();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        setStatus,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
