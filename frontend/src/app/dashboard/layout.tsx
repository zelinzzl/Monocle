"use client";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import ProtectedRoute from "@/components/protected-route";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Uncomment the ProtectedRoute component to protect the dashboard layout
  // <ProtectedRoute>
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1">
        <Sidebar isCollapsed={isCollapsed} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
    // </ProtectedRoute>
  );
}
