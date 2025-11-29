import api from "./config";

const generalLedgerApi = {
  // Get general ledger entries
  getGeneralLedger: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/general-ledger${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get account ledger with running balance
  getAccountLedger: async (accountCode, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/general-ledger/account/${accountCode}${
        queryString ? `?${queryString}` : ""
      }`
    );
    return response.data;
  },

  // Get account balance
  getAccountBalance: async (accountCode, asOfDate = null) => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : "";
    const response = await api.get(
      `/general-ledger/balance/${accountCode}${params}`
    );
    return response.data;
  },

  // Get trial balance
  getTrialBalance: async (asOfDate = null) => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : "";
    const response = await api.get(`/general-ledger/trial-balance${params}`);
    return response.data;
  },

  // Get balance sheet
  getBalanceSheet: async (asOfDate = null) => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : "";
    const response = await api.get(`/general-ledger/balance-sheet${params}`);
    return response.data;
  },

  // Get profit & loss statement
  getProfitAndLoss: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const queryString = params.toString();
    const response = await api.get(
      `/general-ledger/profit-loss${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get ledger summary
  getLedgerSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/general-ledger/summary${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
};

export default generalLedgerApi;
