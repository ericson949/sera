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
      label: "Casa",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Journal",
      href: "/results",
      icon: Calendar,
    },
    {
      label: "Market",
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
                  ? item.highlight
                    ? "scale-110 text-primary"
                    : "scale-110 text-secondary"
                  : "text-muted hover:text-foreground",
                item.highlight && !isActive && "text-tertiary"
              )}
            />
            <span
              className={cn(
                "mt-1 text-[10px] font-medium transition-colors",
                isActive
                  ? item.highlight
                    ? "font-semibold text-primary"
                    : "font-semibold text-secondary"
                  : "text-muted"
              )}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                className={cn(
                  "absolute bottom-0 h-0.5 w-4 rounded-full",
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
