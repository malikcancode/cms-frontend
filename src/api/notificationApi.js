import api from "./config";

export const notificationApi = {
  getMyNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(
        `/notifications?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error.response?.data || error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error.response?.data || error;
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error.response?.data || error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error.response?.data || error;
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error.response?.data || error;
    }
  },

  // Delete all read notifications
  deleteAllRead: async () => {
    try {
      const response = await api.delete("/notifications/read/all");
      return response.data;
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      throw error.response?.data || error;
    }
  },
};

export default notificationApi;
