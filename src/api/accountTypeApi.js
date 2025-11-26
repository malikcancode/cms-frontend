import api from "./authApi";

// Account Type API functions
export const accountTypeApi = {
  // Get all account types
  getAll: async () => {
    try {
      const response = await api.get("/account-types");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch account types" }
      );
    }
  },

  // Get single account type by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/account-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch account type" };
    }
  },

  // Create new account type
  create: async (accountTypeData) => {
    try {
      const response = await api.post("/account-types", accountTypeData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to create account type" }
      );
    }
  },

  // Update account type
  update: async (id, accountTypeData) => {
    try {
      const response = await api.put(`/account-types/${id}`, accountTypeData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to update account type" }
      );
    }
  },

  // Delete account type
  delete: async (id) => {
    try {
      const response = await api.delete(`/account-types/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to delete account type" }
      );
    }
  },
};

export default accountTypeApi;
