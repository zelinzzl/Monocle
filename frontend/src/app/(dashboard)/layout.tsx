"use client";
import DashboardHeader from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { registerPushNotifications } from "@/utils/notifications";
import NotificationMessageModal from "@/components/notification/page";
import { usePushNotifications } from "@/hooks/usePushNotification";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { message, setMessage } = usePushNotifications();

  useEffect(() => {
    if (user?.id) {
      registerPushNotifications(user.id);
    }
  }, [user]);
  return (
    // <ProtectedRoute>
    <div className="flex min-h-screen w-full">
      <Sidebar isCollapsed={isCollapsed} />

      <div
        className={cn(
          "flex-1 flex flex-col ml-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-[70px]" : "md:ml-64"
        )}>
        <DashboardHeader
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
      <NotificationMessageModal
        message={message}
        onClose={() => setMessage(null)}
      />
    </div>
    // </ProtectedRoute>
  );
}
