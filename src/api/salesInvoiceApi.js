import api from "./authApi";

// Sales Invoice API functions
export const salesInvoiceApi = {
  // Get all sales invoices
  getAll: async () => {
    try {
      const response = await api.get("/sales-invoices");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch sales invoices" }
      );
    }
  },

  // Get single sales invoice by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/sales-invoices/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch sales invoice" }
      );
    }
  },

  // Get sales invoices by customer
  getByCustomer: async (customerId) => {
    try {
      const response = await api.get(`/sales-invoices/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch sales invoices" }
      );
    }
  },

  // Get sales invoices by project
  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/sales-invoices/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch sales invoices" }
      );
    }
  },

  // Get sales invoices by date range
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get(
        `/sales-invoices/daterange?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch sales invoices" }
      );
    }
  },

  // Create new sales invoice
  create: async (salesInvoiceData) => {
    try {
      const response = await api.post("/sales-invoices", salesInvoiceData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to create sales invoice" }
      );
    }
  },

  // Update sales invoice
  update: async (id, salesInvoiceData) => {
    try {
      const response = await api.put(`/sales-invoices/${id}`, salesInvoiceData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to update sales invoice" }
      );
    }
  },

  // Delete sales invoice
  delete: async (id) => {
    try {
      const response = await api.delete(`/sales-invoices/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to delete sales invoice" }
      );
    }
  },
};

export default salesInvoiceApi;
