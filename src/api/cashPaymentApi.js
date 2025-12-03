import api from "./config";

// Get all cash payments
export const getCashPayments = async () => {
  try {
    const response = await api.get("/cashpayments");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single cash payment by ID
export const getCashPaymentById = async (id) => {
  try {
    const response = await api.get(`/cashpayments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new cash payment
export const createCashPayment = async (paymentData) => {
  try {
    const response = await api.post("/cashpayments", paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update cash payment
export const updateCashPayment = async (id, paymentData) => {
  try {
    const response = await api.put(`/cashpayments/${id}`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete cash payment
export const deleteCashPayment = async (id) => {
  try {
    const response = await api.delete(`/cashpayments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get cash payments by project
export const getCashPaymentsByProject = async (projectId) => {
  try {
    const response = await api.get(`/cashpayments/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get cash payments by date range
export const getCashPaymentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/cashpayments/daterange`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get expense accounts from Chart of Accounts (sub-accounts only)
export const getExpenseAccounts = async () => {
  try {
    const response = await api.get("/cashpayments/expense-accounts");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getCashPayments,
  getCashPaymentById,
  createCashPayment,
  updateCashPayment,
  deleteCashPayment,
  getCashPaymentsByProject,
  getCashPaymentsByDateRange,
  getExpenseAccounts,
};
