"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import clsx from "clsx";
import { useAlerts } from "@/hooks/useAlerts"; // Assuming you have this hook
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/auth-context";

interface NotificationAlert {
  id: string;
  title: string;
  status: "triggered" | "active" | "inactive";
  timestamp: string;
  destinationName: string;
  priceThreshold?: number;
  currentPrice?: number;
}

export default function NotificationPage() {
  const { user } = useAuth();
  const { alerts, loading, error } = useAlerts(user?.id || "");
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const mappedNotifications = alerts.map((alert) => ({
        id: alert.id,
        title: `Price alert for ${alert.destinationId}`,
        status: alert.status,
        timestamp: formatDistanceToNow(new Date(alert.updatedAt), {
          addSuffix: true,
        }),
        destinationName: alert.destinationId,
        priceThreshold: alert.priceThreshold,
        currentPrice: alert.currentPrice, // Assuming your alert model might include this
      }));
      setNotifications(mappedNotifications);
    }
  }, [alerts]);

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

  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3 w-full">
          {notifications.map((alert) => (
            <div
              key={alert.id}
              className={clsx(
                "flex items-center justify-between px-6 py-4 rounded-lg border shadow-sm transition",
                "bg-light hover:bg-muted/70",
                alert.status === "triggered"
                  ? "border-yellow-400 bg-yellow-50"
                  : ""
              )}
            >
              {/* Left: Bell icon + title */}
              <div className="flex items-center gap-3">
                <Bell
                  size={18}
                  className={clsx(
                    "text-foreground",
                    alert.status === "triggered" ? "text-yellow-600" : "",
                    alert.status === "active" ? "text-green-600" : "",
                    alert.status === "inactive" ? "text-gray-400" : ""
                  )}
                />
                <div>
                  <span className="text-base font-medium">{alert.title}</span>
                  {alert.priceThreshold && (
                    <p className="text-sm text-muted-foreground">
                      Threshold: ${alert.priceThreshold}
                      {alert.currentPrice && (
                        <span className="ml-2">
                          Current: ${alert.currentPrice}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Center: Status */}
              <div
                className={clsx(
                  "flex items-center gap-1 font-semibold text-sm",
                  alert.status === "triggered" ? "text-yellow-600" : "",
                  alert.status === "active" ? "text-green-600" : "",
                  alert.status === "inactive" ? "text-gray-500" : ""
                )}
              >
                {alert.status.toUpperCase()}
                {alert.status === "triggered" ? (
                  <span className="ml-1 animate-pulse">🚨</span>
                ) : alert.status === "active" ? (
                  <Check size={16} className="ml-1" />
                ) : (
                  <X size={16} className="ml-1" />
                )}
              </div>

              {/* Right: Timestamp */}
              <span className="text-sm text-muted-foreground">
                {alert.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
