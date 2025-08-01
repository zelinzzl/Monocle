import { ThemeSwitcher } from "../layout/theme-switch";
import { Button } from "@/components/ui/button";
import { Icon } from "../ui/icons/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { P } from "../ui/typography";
import { useState, useEffect } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { Check } from "lucide-react";
import clsx from "clsx";

function DashboardHeader({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { alerts, toggleAlertStatus, removeAlert } = useAlerts(user?.id || "");
  const [unreadCount, setUnreadCount] = useState(0);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNotificationClick = (id: string, status: string) => {
    toggleAlertStatus(id, status as "new" | "read");
  };

  useEffect(() => {
    if (alerts) {
      const unread = alerts.filter(alert => alert.status === "new").length;
      setUnreadCount(unread);
    }
  }, [alerts]);

  return (
    <header className="sticky top-0 z-10 flex h-15 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Icon
          name={isCollapsed ? "ChevronDoubleRight" : "ChevronDoubleLeft"}
          size="md"
        />
      </Button>

      {/* <P className="w-full">Insurance portal</P> */}

      <div className="flex w-full items-center justify-end gap-4">
        <ThemeSwitcher />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Icon name="Bell" size="md" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <div className="text-sm font-semibold">Notifications</div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={clsx(
                      "flex items-start gap-3 p-4 border-b hover:bg-muted/50 cursor-pointer",
                      alert.status === "new" && "bg-blue-50/50"
                    )}
                    onClick={() => handleNotificationClick(alert.id, alert.status)}
                  >
                    <div
                      className={clsx(
                        "flex items-center justify-center h-8 w-8 rounded-full mt-1",
                        alert.status === "new" ? "bg-blue-100" : "bg-gray-100"
                      )}
                    >
                      <Icon
                        name="Bell"
                        size="sm"
                        className={clsx(
                          alert.status === "new" ? "text-blue-600" : "text-gray-500"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{alert.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {alert.displayDate || alert.timestamp}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {alert.status === "read" && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No notifications
                </div>
              )}
            </div>
            {alerts && alerts.length > 0 && (
              <div className="p-2 border-t text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/notifications")}
                >
                  View all
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user?.avatar_url} alt="@shadcn" />
              <AvatarFallback>{}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="text-sm font-medium mb-1">{user?.name}</div>
            <div className="text-sm text-muted-foreground mb-3">
              {user?.email}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleProfileClick}>
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleSettingsClick}>
                Settings
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

export default DashboardHeader;