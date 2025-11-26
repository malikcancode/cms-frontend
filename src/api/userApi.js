import api from "./authApi";

// User API functions
export const userApi = {
  // Get all users
  getAll: async () => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch users" };
    }
  },

  // Get single user by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user" };
    }
  },

  // Create new user
  create: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create user" };
    }
  },

  // Update user
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update user" };
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete user" };
    }
  },

  // Toggle user status (activate/deactivate)
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to toggle user status" };
    }
  },
};

export default userApi;
