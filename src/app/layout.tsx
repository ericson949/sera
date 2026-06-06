import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientInitializer from "@/shared/presentation/components/ClientInitializer";
import BottomNav from "@/modules/meal-planning/presentation/components/BottomNav";

export const metadata: Metadata = {
  title: "Dinnero — AI Meal Planner Italy",
  description: "Stop wasting money on groceries. Get a full week of dinners under your budget in 60 seconds.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dinnero",
  },
};

export const viewport: Viewport = {
  themeColor: "#E85D04",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full bg-[#f3f1ea]">
      <body className="h-full font-sans antialiased text-foreground">
        <ClientInitializer />
        {/* Centered mobile viewport frame */}
        <div className="w-full max-w-[480px] mx-auto min-h-screen bg-background shadow-[0_0_40px_rgba(0,0,0,0.05)] border-x border-border/80 flex flex-col relative">
          <main className="flex-1 flex flex-col pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
