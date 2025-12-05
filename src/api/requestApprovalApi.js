import apiClient from "./config";

export const requestApprovalApi = {
  // Create a new request (for operators and custom users)
  createRequest: async (requestData) => {
    try {
      const response = await apiClient.post("/request-approvals", requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create request" };
    }
  },

  // Get user's own requests
  getMyRequests: async () => {
    try {
      const response = await apiClient.get("/request-approvals/my-requests");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch your requests",
        }
      );
    }
  },

  // Get all pending requests (Admin only)
  getPendingRequests: async () => {
    try {
      const response = await apiClient.get("/request-approvals/pending");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch pending requests",
        }
      );
    }
  },

  // Get all requests with optional status filter (Admin only)
  getAllRequests: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get("/request-approvals", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch requests" };
    }
  },

  // Approve a request (Admin only)
  approveRequest: async (requestId, adminResponse = "") => {
    try {
      const response = await apiClient.put(
        `/request-approvals/${requestId}/approve`,
        { adminResponse }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to approve request" };
    }
  },

  // Reject a request (Admin only)
  rejectRequest: async (requestId, adminResponse) => {
    try {
      const response = await apiClient.put(
        `/request-approvals/${requestId}/reject`,
        { adminResponse }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reject request" };
    }
  },

  // Delete a request
  deleteRequest: async (requestId) => {
    try {
      const response = await apiClient.delete(
        `/request-approvals/${requestId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete request" };
    }
  },

  // Get request statistics (Admin only)
  getRequestStats: async () => {
    try {
      const response = await apiClient.get("/request-approvals/stats");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch request statistics",
        }
      );
    }
  },
};
