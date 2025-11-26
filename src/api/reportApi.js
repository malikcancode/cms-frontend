import api from "./authApi";

// Report API functions
export const reportApi = {
  // Get income statement
  getIncomeStatement: async (startDate, endDate) => {
    try {
      let url = "/reports/income-statement";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch income statement" }
      );
    }
  },

  // Get inventory report
  getInventoryReport: async () => {
    try {
      const response = await api.get("/reports/inventory");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch inventory report" }
      );
    }
  },

  // Get supplier ledger
  getSupplierLedger: async (supplierId, startDate, endDate) => {
    try {
      let url = `/reports/supplier-ledger/${supplierId}`;
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch supplier ledger" }
      );
    }
  },
};

export default reportApi;
