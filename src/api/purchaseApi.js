import api from "./authApi";

// Purchase API functions
export const purchaseApi = {
  // Get all purchases
  getAll: async () => {
    try {
      const response = await api.get("/purchases");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch purchases" };
    }
  },

  // Get single purchase by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch purchase" };
    }
  },

  // Get purchases by vendor
  getByVendor: async (vendorName) => {
    try {
      const response = await api.get(`/purchases/vendor/${vendorName}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch purchases" };
    }
  },

  // Get purchases by date range
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get(
        `/purchases/daterange?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch purchases" };
    }
  },

  // Create new purchase
  create: async (purchaseData) => {
    try {
      const response = await api.post("/purchases", purchaseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create purchase" };
    }
  },

  // Update purchase
  update: async (id, purchaseData) => {
    try {
      const response = await api.put(`/purchases/${id}`, purchaseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update purchase" };
    }
  },

  // Delete purchase
  delete: async (id) => {
    try {
      const response = await api.delete(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete purchase" };
    }
  },
};

export default purchaseApi;
