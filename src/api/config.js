import axios from "axios";

// ============================================
// API Configuration
// ============================================

// Production URL
const API_URL = "https://cms-backend-production-63bd.up.railway.app/api";

// Local URL (uncomment for local development)
// const API_URL = "http://localhost:5000/api";

// ============================================

// Create axios instance with base configuration and security settings
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 60 seconds for serverless cold starts
  withCredentials: true, // Enable sending cookies for CSRF protection
  maxRedirects: 5, // Limit redirects
  validateStatus: (status) => status >= 200 && status < 300,
});

// Add token to requests with security enhancements
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging and security logging
    config.metadata = { startTime: new Date() };

    // Prevent caching of sensitive data
    if (config.method === "get" && config.url.includes("/api/")) {
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers["Pragma"] = "no-cache";
      config.headers["Expires"] = "0";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors with enhanced security
api.interceptors.response.use(
  (response) => {
    // Log response time for monitoring
    if (response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.debug(`API call to ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error - please check your connection");
    }

    return Promise.reject(error);
  }
);

export { API_URL, api };
export default api;
