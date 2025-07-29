"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/UI/card"
import clsx from "clsx"

interface Alert {
  id: string
  title: string
  status: "Success" | "Fail"
  timestamp: string
}

const sampleAlerts: Alert[] = [
  { id: "1", title: "T143 was updated", status: "Success", timestamp: "16:22" },
  { id: "2", title: "T143 was updated", status: "Success", timestamp: "16:22" },
  { id: "3", title: "T144 was added", status: "Fail", timestamp: "16:22" },
]

export default function NotificationPage() {
  const [alerts] = useState<Alert[]>(sampleAlerts)

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map(alert => (
          <Card
            key={alert.id}
            className="border border-gray-200 rounded-md bg-white shadow-sm hover:shadow transition"
          >
            <CardContent className="flex items-center justify-between px-4 py-2">
              <div className="text-sm text-gray-800">{alert.title}</div>

              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "text-xs font-medium px-2 py-1 rounded-md bg-gray-200 text-gray-800"
                  )}
                >
                  {alert.status}
                </span>
                <span className="text-xs text-gray-500">{alert.timestamp}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
