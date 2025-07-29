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
    <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="space-y-3">
        {alerts.map(alert => (
          <Card key={alert.id} className="border-2 border-black w-[320px]">
            <CardContent className="flex flex-row items-center justify-between px-4 py-2">
              <span className="text-base font-medium">{alert.title}</span>
              <span
                className={clsx(
                  "text-sm px-2 py-0.5 border rounded",
                  alert.status === "Success"
                    ? "text-green-700 border-green-700"
                    : "text-red-700 border-red-700"
                )}
              >
                {alert.status}
              </span>
              <span className="text-sm text-gray-500">{alert.timestamp}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
