import api from "./config";

const journalEntryApi = {
  // Get all journal entries
  getJournalEntries: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/journal-entries${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get single journal entry
  getJournalEntryById: async (id) => {
    const response = await api.get(`/journal-entries/${id}`);
    return response.data;
  },

  // Create new journal entry
  createJournalEntry: async (data) => {
    const response = await api.post("/journal-entries", data);
    return response.data;
  },

  // Update journal entry (only drafts)
  updateJournalEntry: async (id, data) => {
    const response = await api.put(`/journal-entries/${id}`, data);
    return response.data;
  },

  // Delete journal entry (only drafts)
  deleteJournalEntry: async (id) => {
    const response = await api.delete(`/journal-entries/${id}`);
    return response.data;
  },

  // Post a draft journal entry
  postJournalEntry: async (id) => {
    const response = await api.post(`/journal-entries/${id}/post`);
    return response.data;
  },

  // Reverse a posted journal entry
  reverseJournalEntry: async (id, reason) => {
    const response = await api.post(`/journal-entries/${id}/reverse`, {
      reason,
    });
    return response.data;
  },

  // Get journal entries by account
  getJournalEntriesByAccount: async (accountCode, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/journal-entries/account/${accountCode}${
        queryString ? `?${queryString}` : ""
      }`
    );
    return response.data;
  },
};

export default journalEntryApi;
