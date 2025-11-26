import api from "./authApi";

// Item/Inventory API functions
export const itemApi = {
  // Get all items
  getAll: async () => {
    try {
      const response = await api.get("/items");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch items" };
    }
  },

  // Get single item by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch item" };
    }
  },

  // Get item by code
  getByCode: async (code) => {
    try {
      const response = await api.get(`/items/code/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch item" };
    }
  },

  // Get items by category
  getByCategory: async (categoryCode) => {
    try {
      const response = await api.get(`/items/category/${categoryCode}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch items" };
    }
  },

  // Get items by subcategory
  getBySubCategory: async (subCategoryCode) => {
    try {
      const response = await api.get(`/items/subcategory/${subCategoryCode}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch items" };
    }
  },

  // Create new item
  create: async (itemData) => {
    try {
      const response = await api.post("/items", itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create item" };
    }
  },

  // Update item
  update: async (id, itemData) => {
    try {
      const response = await api.put(`/items/${id}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update item" };
    }
  },

  // Delete item
  delete: async (id) => {
    try {
      const response = await api.delete(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete item" };
    }
  },
};

export default itemApi;
