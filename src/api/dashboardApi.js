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

  // Get expense breakdown
  getExpenseBreakdown: async () => {
    try {
      const response = await api.get("/dashboard/expense-breakdown");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch expense breakdown" }
      );
    }
  },

  // Get revenue trend
  getRevenueTrend: async () => {
    try {
      const response = await api.get("/dashboard/revenue-trend");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch revenue trend" }
      );
    }
  },

  // Get revenue vs expenses
  getRevenueVsExpenses: async () => {
    try {
      const response = await api.get("/dashboard/revenue-vs-expenses");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch revenue vs expenses",
        }
      );
    }
  },

  // Get project status distribution
  getProjectStatus: async () => {
    try {
      const response = await api.get("/dashboard/project-status");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch project status" }
      );
    }
  },

  // Get cash flow
  getCashFlow: async () => {
    try {
      const response = await api.get("/dashboard/cash-flow");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch cash flow" };
    }
  },

  // Get top projects
  getTopProjects: async () => {
    try {
      const response = await api.get("/dashboard/top-projects");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch top projects" };
    }
  },

  // Get projects over budget
  getProjectsOverBudget: async () => {
    try {
      const response = await api.get("/dashboard/projects-over-budget");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch projects over budget",
        }
      );
    }
  },

  // Get accounts receivable
  getAccountsReceivable: async () => {
    try {
      const response = await api.get("/dashboard/accounts-receivable");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch accounts receivable",
        }
      );
    }
  },

  // Get accounts payable
  getAccountsPayable: async () => {
    try {
      const response = await api.get("/dashboard/accounts-payable");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch accounts payable" }
      );
    }
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    try {
      const response = await api.get("/dashboard/low-stock-alerts");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch low stock alerts" }
      );
    }
  },

  // Get top suppliers
  getTopSuppliers: async () => {
    try {
      const response = await api.get("/dashboard/top-suppliers");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch top suppliers" }
      );
    }
  },

  // Get top customers
  getTopCustomers: async () => {
    try {
      const response = await api.get("/dashboard/top-customers");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch top customers" }
      );
    }
  },
};

export default dashboardApi;
