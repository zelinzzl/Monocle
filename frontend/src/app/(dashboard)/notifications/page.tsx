"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import clsx from "clsx";
import { useAlerts } from "@/hooks/useAlerts";
import { useAuth } from "@/context/auth-context";

interface NotificationAlert {
  id: string;
  title: string;
  status: "new" | "read";
  timestamp: string;
  displayDate?: string; // Optional for legacy support
}

export default function NotificationPage() {
  const { user } = useAuth();
  const { alerts, loading, error, toggleAlertStatus, removeAlert } = useAlerts(
    user?.id || ""
  );
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  
  useEffect(() => {
    if (alerts.length > 0) {
      const mappedNotifications = alerts.map((alert: NotificationAlert) => ({
        id: alert.id,
        title: alert.title,
        status: alert.status,
        timestamp: alert.displayDate || alert.timestamp,
      }));
      setNotifications(mappedNotifications);
    } else {
      setNotifications([]);
    }
  }, [alerts]);

  // Categorize notifications
  const unreadNotifications = notifications.filter(alert => alert.status === "new");
  const readNotifications = notifications.filter(alert => alert.status === "read");

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <h1 className="text-2xl font-semibold mb-6">Notifications</h1>
        <div className="flex justify-center">
          <p>Loading notifications...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background p-6">
        <h1 className="text-2xl font-semibold mb-6">Notifications</h1>
        <div className="text-red-500">{error}</div>
      </main>
    );
  }

  const renderNotificationItem = (alert: NotificationAlert) => (
    <div
      key={alert.id}
      className={clsx(
        "flex items-center justify-between px-6 py-4 rounded-lg border shadow-sm transition",
        "bg-background hover:bg-muted/70",
        alert.status === "new" && "border-blue-400",
        alert.status === "read" && "border-gray-300"
      )}
    >
      {/* Left: Bell icon + title */}
      <div className="flex items-center gap-3">
        <Bell
          size={18}
          className={clsx(
            "text-foreground",
            alert.status === "new" ? "text-blue-600" : "text-gray-400"
          )}
        />
        <div>
          <span className="text-base font-medium">{alert.title}</span>
        </div>
      </div>

      {/* Center: Status */}
      <div
        className={clsx(
          "flex items-center gap-1 font-semibold text-sm",
          alert.status === "new" ? "text-blue-600" : "text-gray-500"
        )}
      >
        {alert.status.toUpperCase()}
        {alert.status === "new" && (
          <span className="ml-1 animate-pulse">🔔</span>
        )}
        {alert.status === "read" && (
          <Check size={16} className="ml-1" />
        )}
      </div>

      {/* Right: Timestamp + Actions */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {alert.timestamp}
        </span>
        <button
          onClick={() => toggleAlertStatus(alert.id, alert.status)}
          className={clsx(
            "px-3 py-1 text-xs text-white rounded",
            alert.status === "new"
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-500 hover:bg-gray-600"
          )}
        >
          {alert.status === "new" ? "Mark as Read" : "Mark as New"}
        </button>
        <button
          onClick={() => removeAlert(alert.id)}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-6 w-full">
          {/* New & Unread Notifications Section */}
          {unreadNotifications.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 text-blue-600">New & Unread</h2>
              <div className="space-y-3">
                {unreadNotifications.map(renderNotificationItem)}
              </div>
            </div>
          )}

          {/* Read Notifications Section */}
          {readNotifications.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 text-gray-500">Read</h2>
              <div className="space-y-3">
                {readNotifications.map(renderNotificationItem)}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}