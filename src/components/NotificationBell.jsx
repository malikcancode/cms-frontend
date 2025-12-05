"use client";

import { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../api/notificationApi";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate("/dashboard/notifications");
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-muted rounded-lg transition-colors"
      title={`Notifications (${unreadCount} unread)`}
    >
      <FiBell className="w-5 h-5 text-foreground" />
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg z-10"
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
