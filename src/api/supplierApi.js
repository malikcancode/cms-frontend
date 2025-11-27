import axios from "axios";

// Backend API URL
const API_URL = "https://cms-backend-production-63bd.up.railway.app/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
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

// Supplier API functions
export const supplierApi = {
  // Get all suppliers
  getAll: async () => {
    try {
      const response = await api.get("/suppliers");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching suppliers" };
    }
  },

  // Get single supplier
  getById: async (id) => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching supplier" };
    }
  },

  // Create supplier
  create: async (supplierData) => {
    try {
      const response = await api.post("/suppliers", supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error creating supplier" };
    }
  },

  // Update supplier
  update: async (id, supplierData) => {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating supplier" };
    }
  },

  // Delete supplier
  delete: async (id) => {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error deleting supplier" };
    }
  },

  // Get suppliers by category
  getByCategory: async (category) => {
    try {
      const response = await api.get(`/suppliers/category/${category}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error fetching suppliers by category",
        }
      );
    }
  },
};
