import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/auth") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userEmail");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
