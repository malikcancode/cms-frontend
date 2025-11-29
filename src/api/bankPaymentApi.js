import api from "./config";

// Get all bank payments
export const getBankPayments = async () => {
  try {
    const response = await api.get("/bankpayments");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single bank payment by ID
export const getBankPaymentById = async (id) => {
  try {
    const response = await api.get(`/bankpayments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new bank payment
export const createBankPayment = async (paymentData) => {
  try {
    const response = await api.post("/bankpayments", paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update bank payment
export const updateBankPayment = async (id, paymentData) => {
  try {
    const response = await api.put(`/bankpayments/${id}`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete bank payment
export const deleteBankPayment = async (id) => {
  try {
    const response = await api.delete(`/bankpayments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get bank enum values
export const getBankEnum = async () => {
  try {
    const response = await api.get("/bankpayments/enums/banks");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get expense accounts from Chart of Accounts
export const getExpenseAccounts = async () => {
  try {
    const response = await api.get("/bankpayments/expense-accounts");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate next serial number
export const generateSerialNumber = async () => {
  try {
    const response = await api.get("/bankpayments/generate-serial");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getBankPayments,
  getBankPaymentById,
  createBankPayment,
  updateBankPayment,
  deleteBankPayment,
  getBankEnum,
  getExpenseAccounts,
  generateSerialNumber,
};
