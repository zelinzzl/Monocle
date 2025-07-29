"use client";

import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import clsx from "clsx";

interface Alert {
  id: string;
  title: string;
  status: "Success" | "Fail";
  timestamp: string;
}

const sampleAlerts: Alert[] = [
  { id: "1", title: "Name was updated", status: "Success", timestamp: "16:28" },
  { id: "2", title: "Email was updated", status: "Success", timestamp: "16:22" },
  { id: "3", title: "Email was updated", status: "Fail", timestamp: "16:19" },
];

export default function NotificationPage() {
  const [alerts] = useState<Alert[]>(sampleAlerts);

  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      <div className="space-y-3 w-full">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={clsx(
              "flex items-center justify-between px-6 py-4 rounded-lg border shadow-sm transition",
              "bg-light hover:bg-muted/70"
            )}
          >
            {/* Left: Bell icon + title */}
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-foreground" />
              <span className="text-base font-medium">{alert.title}</span>
            </div>

            {/* Center: Status (bold + icon after text) */}
            <div
              className={clsx(
                "flex items-center gap-1 font-semibold text-sm",
                alert.status === "Success"
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {alert.status}
              {/* {alert.status === "Success" ? (
                // <Check size={16} />
              ) : (
                // <X size={16} />
              )} */}
            </div>

            {/* Right: Timestamp */}
            <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
