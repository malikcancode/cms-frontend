import api from "./config";

export const tenantApi = {
  register: async (tenantData) => {
    const response = await api.post("/tenant/register", tenantData);
    return response.data;
  },

  getAllTenants: async () => {
    const response = await api.get("/tenant/all");
    return response.data;
  },

  getTenantById: async (tenantId) => {
    const response = await api.get(`/tenant/${tenantId}`);
    return response.data;
  },

  getCurrentTenant: async () => {
    const response = await api.get("/tenant/current/info");
    return response.data;
  },
};

export default tenantApi;
