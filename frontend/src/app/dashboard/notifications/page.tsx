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
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      <div className="space-y-3 w-full max-w-4xl">
        {alerts.map(alert => (
          <Card key={alert.id} className="border border-gray-300 w-full">
            <CardContent className="flex flex-row items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-base font-medium">{alert.title}</span>
                <span
                  className={clsx(
                    "text-sm px-2 py-0.5 border rounded-md",
                    alert.status === "Success"
                      ? "text-green-700 border-green-700"
                      : "text-red-700 border-red-700"
                  )}
                >
                  {alert.status}
                </span>
              </div>
              <div className="ml-4 text-sm text-gray-500">{alert.timestamp}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
