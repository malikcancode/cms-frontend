import axios from "axios";

// Backend API URL
const API_URL = "https://cms-backend-production-63bd.up.railway.app/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 60 seconds for serverless cold starts
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  // Login user
  login: async (email, password) => {
    try {
      console.log(
        "Making API request to:",
        api.defaults.baseURL + "/auth/login"
      );
      const response = await api.post("/auth/login", { email, password });
      console.log("API response received:", response);
      return response.data;
    } catch (error) {
      console.error("API request failed:", error);
      if (error.code === "ECONNABORTED") {
        throw { message: "Request timeout - server not responding" };
      }
      if (error.code === "ERR_NETWORK") {
        throw { message: "Network error - cannot reach server" };
      }
      throw (
        error.response?.data || { message: error.message || "Login failed" }
      );
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user" };
    }
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default api;
