"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, ShoppingBag, Crown } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide nav on onboarding pages
  if (pathname === "/onboarding" || pathname === "/" || pathname?.includes("/onboarding")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Plan",
      href: "/results",
      icon: Calendar,
    },
    {
      label: "Spesa",
      href: "/shopping-list",
      icon: ShoppingBag,
    },
    {
      label: "Pro",
      href: "/pricing",
      icon: Crown,
      highlight: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card border-t border-border/80 px-6 py-2.5 flex justify-between items-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 py-1 tap-highlight relative"
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-all",
                isActive
                  ? item.highlight
                    ? "text-primary scale-110"
                    : "text-secondary scale-110"
                  : "text-muted hover:text-foreground",
                item.highlight && !isActive && "text-amber-500 animate-pulse"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-semibold mt-1 transition-colors",
                isActive
                  ? item.highlight
                    ? "text-primary font-bold"
                    : "text-secondary font-bold"
                  : "text-muted"
              )}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                className={cn(
                  "absolute bottom-0 w-4 h-0.5 rounded-full",
                  item.highlight ? "bg-primary" : "bg-secondary"
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
