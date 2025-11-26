import api from "./authApi";

// Project API functions
export const projectApi = {
  // Get all projects
  getAll: async () => {
    try {
      const response = await api.get("/projects");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch projects" };
    }
  },

  // Get single project
  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching project" };
    }
  },

  // Get project ledger with expenses and profit
  getLedger: async (id) => {
    try {
      const response = await api.get(`/projects/${id}/ledger`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error fetching project ledger" }
      );
    }
  },

  // Create new project
  create: async (projectData) => {
    try {
      const response = await api.post("/projects", projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create project" };
    }
  },

  // Update project
  update: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update project" };
    }
  },

  // Delete project
  delete: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete project" };
    }
  },
};

export default projectApi;
