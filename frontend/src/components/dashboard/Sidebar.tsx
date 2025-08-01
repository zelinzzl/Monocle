"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon } from "../ui/icons/Icon";
import Logo from "../logo/Logo";
import { P } from "../ui/typography";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useAuth } from "@/context/auth-context";

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoSize = isCollapsed ? 30 : 40;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Sidebar logout clicked");
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
        <Link href="/" className="flex items-center gap-10 font-semibold">
          <Logo size={logoSize} />
          {!isCollapsed && <P className="text-lg justify-center">MONOCLE</P>}
        </Link>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="grid items-start px-2 gap-3 text-sm font-medium">
          <Link
            href="/home"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/home" && "bg-muted text-primary"
            )}
          >
            <Icon name="Home" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Home</P>}
          </Link>

          <Link
            href="/insure"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/insure" && "bg-muted text-primary"
            )}
          >
            <Icon name="Briefcase" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Insure</P>}
          </Link>

          <Link
            href="/vehicle"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/vehicle" && "bg-muted text-primary"
            )}
          >
            <Icon name="Truck" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Vehicles</P>}
          </Link>

          <Link
            href="/claims"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/claims" && "bg-muted text-primary"
            )}
          >
            <Icon name="Document" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Claims</P>}
          </Link>

          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/chat" && "bg-muted text-primary"
            )}
          >
            <Icon name="ChatBubbleBottomCenter" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Chat</P>}
          </Link>

          <Link
            href="/map"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/map" && "bg-muted text-primary"
            )}
          >
            <Icon name="Map" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Map</P>}
          </Link>

          <Link
            href="/travel-risk"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/travel-risk" && "bg-muted text-primary"
            )}
          >
            <Icon name="Truck" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Travel Risk</P>}
          </Link>

          <Link
            href="/notifications"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/notifications" && "bg-muted text-primary"
            )}
          >
            <Icon name="Bell" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Notifications</P>}
          </Link>

          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/profile" && "bg-muted text-primary"
            )}
          >
            <Icon name="User" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Profile</P>}
          </Link>
        </nav>

        {/* UPDATED: Logout button with proper auth context integration */}
        <div className="mt-auto p-2">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/settings" && "bg-muted text-primary"
            )}
          >
            <Icon name="Settings" size={"lg"} isLottie animateOnHover />
            {!isCollapsed && <P className="text-lg">Settings</P>}
          </Link>

          <Button
            variant="ghost"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            onClick={handleLogout}
            disabled={isLoggingOut} // Prevent multiple clicks
          >
            <Icon name="XCircle" size={"lg"} />
            {!isCollapsed && (
              <P className="text-lg">
                {isLoggingOut ? "Logging out..." : "Log out"}
              </P>
            )}
          </Button>

          {/* Optional: Show current user info when not collapsed */}
          {!isCollapsed && user && (
            <div className="mt-2 px-3 py-2 text-xs text-muted-foreground border-t">
              <P className="truncate">Logged in as:</P>
              <P className="truncate font-medium">{user.email}</P>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
          >
            <Icon name="Bars3" size="lg" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "hidden border-r bg-muted/40 md:block fixed h-screen",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      {sidebarContent}
    </div>
  );
}
