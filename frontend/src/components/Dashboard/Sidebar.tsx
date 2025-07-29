"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon } from "../UI/icons/Icon";
import Logo from "../Logo/Logo";
import { P } from "../UI/typography";
import { cn } from "@/lib/utils";
import { Button } from "../UI/button";
import { Sheet, SheetContent, SheetTrigger } from "../UI/sheet";

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const logoSize = isCollapsed ? 30 : 40;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  const sidebarContent = (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] ">
        <Link href="/" className="flex items-center gap-10 font-semibold">
          <Logo size={logoSize} />
          {!isCollapsed && <P className="text-lg justify-center">MONOCLE</P>}
        </Link>
      </div>

      <div className="flex-1 flex flex-col">
        <nav className="grid items-start px-2 gap-3 text-sm font-medium ">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/dashboard" && "bg-muted text-primary"
            )}
          >
            <Icon name="Home" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Home</P>}
          </Link>

          <Link
            href="/dashboard/chat"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/dashboard/chat" && "bg-muted text-primary"
            )}
          >
            <Icon name="ChatBubbleBottomCenter" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Chat</P>}
          </Link>

          <Link
            href="/dashboard/travel-risk"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/dashboard/travel-risk" && "bg-muted text-primary"
            )}
          >
            <Icon name="Truck" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Travel Risk</P>}
          </Link>

          <Link
            href="/dashboard/notifications"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/dashboard/notifications" && "bg-muted text-primary"
            )}
          >
            <Icon name="Bell" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Notifications</P>}
          </Link>

          <Link
            href="/dashboard/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/dashboard/profile" && "bg-muted text-primary"
            )}
          >
            <Icon name="User" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Profile</P>}
          </Link>
        </nav>

        {/* Logout button at the bottom */}
        <div className="mt-auto p-2">
          <Link
            href="/dashboard/settings"
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
          >
            <Icon name="XCircle" size={"lg"} />
            {!isCollapsed && <P className="text-lg">Log out</P>}
          </Button>
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
        "hidden border-r bg-muted/40 md:block",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      {sidebarContent}
    </div>
  );
}
