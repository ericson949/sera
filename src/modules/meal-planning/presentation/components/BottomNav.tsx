"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, UserRound } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useDinneroStore } from "../hooks/useDinneroStore";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function BottomNav() {
  const pathname = usePathname();
  const copy = getProductCopy(useDinneroStore((state) => state.appLanguage));

  // Hide nav on onboarding pages
  if (pathname === "/onboarding" || pathname === "/" || pathname?.includes("/onboarding") || pathname?.startsWith("/new-week")) {
    return null;
  }

  const navItems = [
    {
      label: copy.nav[0],
      href: "/dashboard",
      icon: Home,
    },
    {
      label: copy.nav[1],
      href: "/week",
      icon: CalendarDays,
    },
    {
      label: copy.nav[2],
      href: "/profile",
      icon: UserRound,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-between border-t border-warm-stone/60 bg-background/95 px-6 py-2.5 shadow-[0_-10px_30px_rgba(70,81,62,0.08)]">
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
                "h-5 w-5 stroke-[1.6] transition-all",
                isActive
                  ? "scale-110 text-primary"
                  : "text-muted hover:text-foreground",
              )}
            />
            <span
              className={cn(
                "mt-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "font-semibold text-primary"
                  : "text-muted"
              )}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                className={cn(
                  "absolute bottom-0 h-0.5 w-4 rounded-full",
                  "bg-primary"
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
