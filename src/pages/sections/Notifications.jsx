"use client";

import { useState, useEffect } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiAlertCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";
import { notificationApi } from "../../api/notificationApi";
import Loader from "./Loader";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
    unreadCount: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, [pagination.currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationApi.getMyNotifications(
        pagination.currentPage,
        20
      );
      if (response.success) {
        setNotifications(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationApi.markAsRead(id);
      if (response.success) {
        setNotifications(
          notifications.map((n) =>
            n._id === id ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
        setPagination((prev) => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err.message || "Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        setNotifications(
          notifications.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setPagination((prev) => ({ ...prev, unreadCount: 0 }));
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
      setError(err.message || "Failed to mark all notifications as read");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const response = await notificationApi.deleteNotification(id);
      if (response.success) {
        setNotifications(notifications.filter((n) => n._id !== id));
        setPagination((prev) => ({
          ...prev,
          totalNotifications: prev.totalNotifications - 1,
        }));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(err.message || "Failed to delete notification");
    }
  };
  const handleDeleteAllRead = async () => {
    if (
      !window.confirm("Are you sure you want to delete all read notifications?")
    ) {
      return;
    }

    try {
      const response = await notificationApi.deleteAllRead();
      if (response.success) {
        setNotifications(notifications.filter((n) => !n.isRead));
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Error deleting read notifications:", err);
      setError(err.message || "Failed to delete read notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "request_approved":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case "request_rejected":
        return <FiX className="w-5 h-5 text-red-500" />;
      case "request_created":
        return <FiBell className="w-5 h-5 text-blue-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with all your activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pagination.unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
            <button
              onClick={handleDeleteAllRead}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition flex items-center gap-2"
            >
              <FiTrash2 className="w-4 h-4" />
              Clear Read
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {pagination.totalNotifications}
                </p>
              </div>
              <FiBell className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-primary">
                  {pagination.unreadCount}
                </p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-green-600">
                  {pagination.totalNotifications - pagination.unreadCount}
                </p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 border-b-2 transition ${
              filter === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({pagination.totalNotifications})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 border-b-2 transition ${
              filter === "unread"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({pagination.unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 border-b-2 transition ${
              filter === "read"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Read ({pagination.totalNotifications - pagination.unreadCount})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <FiBell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No notifications
            </h3>
            <p className="text-muted-foreground">
              {filter === "unread"
                ? "You're all caught up!"
                : "No notifications to display"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-card border rounded-lg p-4 transition hover:shadow-md ${
                notification.isRead
                  ? "border-border"
                  : "border-primary bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      {notification.sender && (
                        <p className="text-xs text-muted-foreground">
                          From: {notification.sender.name} (
                          {notification.sender.role})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-2 hover:bg-muted rounded-lg transition"
                          title="Mark as read"
                        >
                          <FiCheck className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                    {!notification.isRead && (
                      <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.max(1, prev.currentPage - 1),
              }))
            }
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.min(prev.totalPages, prev.currentPage + 1),
              }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
