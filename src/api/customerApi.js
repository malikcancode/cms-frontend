import api from "./authApi";

// Customer API functions
export const customerApi = {
  // Get all customers
  getAll: async () => {
    try {
      const response = await api.get("/customers");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch customers" };
    }
  },

  // Get single customer by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch customer" };
    }
  },

  // Get customer by code
  getByCode: async (code) => {
    try {
      const response = await api.get(`/customers/code/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch customer" };
    }
  },

  // Create new customer
  create: async (customerData) => {
    try {
      const response = await api.post("/customers", customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create customer" };
    }
  },

  // Update customer
  update: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update customer" };
    }
  },

  // Delete customer
  delete: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete customer" };
    }
  },
};

export default customerApi;
