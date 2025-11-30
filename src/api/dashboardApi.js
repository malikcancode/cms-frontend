import api from "./authApi";

// Dashboard API functions
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch dashboard stats" }
      );
    }
  },

  // Get recent projects
  getRecentProjects: async (limit = 5) => {
    try {
      const response = await api.get(
        `/dashboard/recent-projects?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch recent projects",
        }
      );
    }
  },

  // Get plot statistics
  getPlotStats: async () => {
    try {
      const response = await api.get("/dashboard/plot-stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch plot stats" };
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const response = await api.get("/dashboard/inventory-stats");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch inventory stats" }
      );
    }
  },
};

export default dashboardApi;
