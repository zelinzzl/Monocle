"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "../Logo/Logo";
import { useTheme } from "@/context/theme-provider";
import { Icon } from "../UI/icons/Icon";

const navigation = [
  { name: "Home", href: "#Home" },
  { name: "Vision", href: "#vision" },
  { name: "Contributors", href: "#contributors" },
  { name: "Demo", href: "#demo" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const firstHalf = navigation.slice(0, 2);
  const secondHalf = navigation.slice(2);

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center">
        {/* Desktop Header */}
        <div className="hidden md:flex relative w-fit h-fit rounded-full px-6 py-2 bg-blue-20/30 border border-white/20 shadow-sm backdrop-blur-md">
          <nav className="flex items-center space-x-6">
            {firstHalf.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}

            <div
              className="relative w-0 px-10 cursor-pointer"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <Logo size={55} />
              </div>
            </div>

            {secondHalf.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Logo Only */}
        <div
          className="md:hidden cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Logo size={20} />
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center space-y-6 px-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}

          <Icon
            name="Swatch"
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
              setMenuOpen(false);
            }}
          />

          <Icon
            name="XCircle"
            onClick={() => setMenuOpen(false)}
            aria-label="Close Menu"
          />
        </div>
      )}
    </>
  );
}
