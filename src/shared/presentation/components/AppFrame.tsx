"use client";

import { usePathname } from "next/navigation";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = pathname === "/" || pathname?.startsWith("/onboarding") || pathname?.startsWith("/new-week") || pathname?.startsWith("/plan-preview") || pathname?.startsWith("/post-onboarding");

  return (
    <main className={`flex flex-1 flex-col ${immersive ? "" : "pb-20"}`}>
      {children}
    </main>
  );
}
