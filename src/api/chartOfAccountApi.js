import api from "./config";

// Get all chart of accounts
export const getChartOfAccounts = async () => {
  try {
    const response = await api.get("/chartofaccounts");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single chart of account by ID
export const getChartOfAccountById = async (id) => {
  try {
    const response = await api.get(`/chartofaccounts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new chart of account
export const createChartOfAccount = async (accountData) => {
  try {
    const response = await api.post("/chartofaccounts", accountData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update chart of account
export const updateChartOfAccount = async (id, accountData) => {
  try {
    const response = await api.put(`/chartofaccounts/${id}`, accountData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete chart of account
export const deleteChartOfAccount = async (id) => {
  try {
    const response = await api.delete(`/chartofaccounts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get account types enum
export const getAccountTypesEnum = async () => {
  try {
    const response = await api.get("/chartofaccounts/enums/types");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getChartOfAccounts,
  getChartOfAccountById,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
  getAccountTypesEnum,
};
