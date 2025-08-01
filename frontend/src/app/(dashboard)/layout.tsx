"use client";
import DashboardHeader from "@/components/Dashboard/Header";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import ProtectedRoute from "@/components/protected-route";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    // <ProtectedRoute>
    <div className="flex min-h-screen w-full">
      <Sidebar isCollapsed={isCollapsed} />
      
      <div 
        className={cn(
          "flex-1 flex flex-col ml-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-[70px]" : "md:ml-64"
        )}
      >
        <DashboardHeader
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
    // </ProtectedRoute>
  );
}