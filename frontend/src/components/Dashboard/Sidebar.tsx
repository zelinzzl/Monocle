"use client";

import Link from "next/link";
import Logo from "../Logo/Logo";
import { Icon } from "../UI/icons/Icon";

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo />
            <span>MONOCLE</span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {/* <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Icon name="Home" size={"md"} />
              Home
            </Link> */}
            <Link
              href="/dashboard/travelrisk"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Icon name="Truck" size={"md"} />
              Travel Risk
            </Link>
            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Icon name="Bell" size={"md"} />
              Notifications
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Icon name="User" size={"md"} />
              Profile
            </Link>
          </nav>

          {/* Logout button at the bottom */}
          <div className="mt-auto p-2">
            <Link
              href="/logout"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Icon name="XCircle" size={"md"} />
              Log out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
